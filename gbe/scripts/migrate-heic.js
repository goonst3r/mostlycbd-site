// One-time migration: convert existing .heic/.heif files in Storage to
// .jpg, and repoint every Firestore field that references them.
//
// Usage:
//   node scripts/migrate-heic.js <path-to-service-account.json> --dry-run
//   node scripts/migrate-heic.js <path-to-service-account.json>
//
// Old .heic/.heif files are left in place in Storage (unreferenced but
// harmless) so nothing is destroyed if something needs to be re-checked.

const path = require('path');
const crypto = require('crypto');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const heicConvert = require('heic-convert');

const keyPath = process.argv[2];
const dryRun = process.argv.includes('--dry-run');

if (!keyPath) {
  console.error('Usage: node scripts/migrate-heic.js <path-to-service-account.json> [--dry-run]');
  process.exit(1);
}

const serviceAccount = require(path.resolve(keyPath));

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'gang-bang-eats.firebasestorage.app',
});

const db = getFirestore();
const bucket = getStorage().bucket();

function isHeicUrl(url) {
  return typeof url === 'string' && /\.(heic|heif)(\?|$)/i.test(url);
}

function storagePathFromUrl(url) {
  const m = url.match(/\/o\/([^?]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

// Some iOS Safari uploads silently transcode HEIC -> JPEG but leave the
// original .heic filename/MIME on the File object, so a "HEIC" file may
// actually already be a perfectly normal JPEG/PNG under a wrong label.
// We sniff the real bytes and only run the expensive libheif transcode
// for files that are genuinely HEIC-encoded (an ISO-BMFF 'ftyp' box).
async function fixOne(oldUrl) {
  const oldPath = storagePathFromUrl(oldUrl);
  if (!oldPath) {
    console.warn('  ! could not parse storage path from', oldUrl);
    return null;
  }

  if (dryRun) {
    console.log(`  ${oldPath} (dry-run: will inspect bytes and fix)`);
    return { urlChanged: false };
  }

  const file = bucket.file(oldPath);
  const [buf] = await file.download();
  const isJpeg = buf.slice(0, 3).toString('hex') === 'ffd8ff';
  const isPng = buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a';
  const isRealHeic = buf.slice(4, 12).toString('latin1').includes('ftyp');

  if (isJpeg || isPng) {
    const contentType = isJpeg ? 'image/jpeg' : 'image/png';
    await file.setMetadata({ contentType });
    console.log(`  ${oldPath} — mislabeled, bytes are actually ${contentType}; fixed Content-Type in place`);
    return { urlChanged: false };
  }

  if (isRealHeic) {
    const newPath = oldPath.replace(/\.(heic|heif)$/i, '.jpg');
    const outputBuffer = await heicConvert({ buffer: buf, format: 'JPEG', quality: 0.85 });
    const token = crypto.randomUUID();
    await bucket.file(newPath).save(outputBuffer, {
      metadata: {
        contentType: 'image/jpeg',
        metadata: { firebaseStorageDownloadTokens: token },
      },
    });
    const newUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(newPath)}?alt=media&token=${token}`;
    console.log(`  ${oldPath}\n    -> ${newPath} (real HEIC, transcoded)`);
    return { urlChanged: true, newUrl };
  }

  console.warn(`  ! ${oldPath} — unrecognized format (magic: ${buf.slice(0, 12).toString('hex')}), skipped`);
  return null;
}

async function migrateArrayField(collection, field) {
  const snap = await db.collection(collection).get();
  for (const doc of snap.docs) {
    const arr = doc.data()[field];
    if (!Array.isArray(arr) || arr.length === 0) continue;
    const heicUrls = arr.filter(isHeicUrl);
    if (heicUrls.length === 0) continue;

    console.log(`\n${collection}/${doc.id} — ${field}: ${heicUrls.length} candidate file(s)`);
    const newArr = [...arr];
    let arrChanged = false;
    for (const oldUrl of heicUrls) {
      const result = await fixOne(oldUrl);
      if (result && result.urlChanged && !dryRun) {
        newArr[newArr.indexOf(oldUrl)] = result.newUrl;
        arrChanged = true;
      }
    }
    if (arrChanged && !dryRun) {
      await doc.ref.update({ [field]: newArr });
      console.log(`  ✓ updated ${collection}/${doc.id} (${field} URLs rewritten)`);
    }
  }
}

async function migrateStringField(collection, field) {
  const snap = await db.collection(collection).get();
  for (const doc of snap.docs) {
    const url = doc.data()[field];
    if (!isHeicUrl(url)) continue;

    console.log(`\n${collection}/${doc.id} — ${field} is a candidate file`);
    const result = await fixOne(url);
    if (result && result.urlChanged && !dryRun) {
      await doc.ref.update({ [field]: result.newUrl });
      console.log(`  ✓ updated ${collection}/${doc.id}`);
    }
  }
}

(async () => {
  console.log(dryRun ? '=== DRY RUN (no writes) ===' : '=== LIVE RUN ===');
  await migrateArrayField('ratings', 'photos');
  await migrateArrayField('restaurants', 'photos');
  await migrateStringField('restaurants', 'img');
  await migrateStringField('members', 'avatarUrl');
  console.log('\nDone.');
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
