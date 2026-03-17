// ── Firebase Configuration ──────────────────────────────────────
// Gang Bang Eats — Firebase compat SDK (no build step needed)

firebase.initializeApp({
  apiKey: 'AIzaSyDR62d-KilYtZc0Y9aQuawHiv8KjkyVMLQ',
  authDomain: 'gang-bang-eats.firebaseapp.com',
  projectId: 'gang-bang-eats',
  storageBucket: 'gang-bang-eats.firebasestorage.app',
  messagingSenderId: '1079967245832',
  appId: '1:1079967245832:web:16a6ecb5c5d5a04acd53bd',
});

const db = firebase.firestore();
const storage = firebase.storage();

// ── Database Helpers ────────────────────────────────────────────

window.DB = {
  // --- Members ---
  subscribeMembers(callback) {
    return db.collection('members').orderBy('name').onSnapshot(snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  async addMember(name) {
    const ref = await db.collection('members').add({
      name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return ref.id;
  },

  async updateMember(id, name) {
    await db.collection('members').doc(id).update({ name });
  },

  // --- Restaurants ---
  subscribeRestaurants(callback) {
    return db.collection('restaurants').orderBy('spot').onSnapshot(snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  async addRestaurant(data) {
    const ref = await db.collection('restaurants').add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return ref.id;
  },

  async updateRestaurant(id, data) {
    await db.collection('restaurants').doc(id).update(data);
  },

  // --- Ratings ---
  subscribeRatings(callback) {
    return db.collection('ratings').orderBy('createdAt', 'desc').onSnapshot(snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  async addRating(data) {
    const ref = await db.collection('ratings').add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return ref.id;
  },

  async updateRating(id, data) {
    await db.collection('ratings').doc(id).update({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },

  async deleteRating(id) {
    await db.collection('ratings').doc(id).delete();
  },

  // --- Photo Upload ---
  async uploadPhoto(file, restaurantId) {
    const filename = Date.now() + '_' + file.name;
    const ref = storage.ref('ratings/' + restaurantId + '/' + filename);
    await ref.put(file);
    return ref.getDownloadURL();
  },

  async uploadPhotos(files, restaurantId) {
    return Promise.all(files.map(f => DB.uploadPhoto(f, restaurantId)));
  },

  // --- Clear All (for reseed) ---
  async clearAllData() {
    for (const col of ['ratings', 'restaurants', 'members']) {
      const snap = await db.collection(col).get();
      await Promise.all(snap.docs.map(d => d.ref.delete()));
    }
  },
};
