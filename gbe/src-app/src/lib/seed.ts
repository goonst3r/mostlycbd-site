import { collection, getDocs, addDoc, serverTimestamp, doc as firestoreDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { clearAllData } from './db';

const RESTAURANTS = [
  // Real images scraped from restaurant websites where available
  // Cuisine-themed Unsplash fallbacks for sites that blocked scraping
  { spot: "Butterjoint", style: "Gastropub", website: "https://butterjoint.com/", img: "https://butterjoint.com/wp-content/uploads/2021/06/Butterjoint-SocialShare-2.webp" },
  { spot: "Moonlit Burgers", style: "Burgers", website: "https://moonlitburgers.com/", img: "https://i0.wp.com/moonlitburgers.com/wp-content/uploads/2021/11/Moonlit-SocialShare.jpg?fit=1920%2C1008&ssl=1" },
  { spot: "Cucino Vitale", style: "Italian", website: "https://cucinavitalepgh.com/", img: "https://static.spotapps.co/web/cucinavitalepgh--com/custom/video_poster_2.jpg" },
  { spot: "Off the Rails BBQ", style: "BBQ", website: "https://obcofftherails.com/", img: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&h=600&fit=crop" },
  { spot: "Mitch's BBQ", style: "BBQ", website: "https://www.facebook.com/MitchsBarbequeRestaurantAndCatering/", img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop" },
  { spot: "Acclimation", style: "Brewery", website: "https://www.acclamationbrewing.com/", img: "https://images.unsplash.com/photo-1559526642-c3f001ea68ee?w=800&h=600&fit=crop" },
  { spot: "Innergroove", style: "Brewery", website: "https://www.innergroovebrewing.com/", img: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=600&fit=crop" },
  { spot: "Hula Bar", style: "Pub", website: "https://www.hulabarpgh.com/", img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop" },
  { spot: "Birmingham Bridge Tavern", style: "Pub", website: "https://www.birminghambridgetavern.com/", img: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&h=600&fit=crop" },
  { spot: "Hot Pot", style: "Korean BBQ", website: "https://honghotpot.com/pittsburgh/", img: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop" },
  { spot: "Mezcal", style: "Mexican", website: "https://mezcalpgh.com/", img: "https://static.spotapps.co/website_images/ab_websites/142794_website/video_poster.jpg" },
  { spot: "Dancing Crab", style: "Thai", website: "https://dancingcrabthai.com/", img: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&h=600&fit=crop" },
  { spot: "Siebs Pub", style: "Pub", website: "https://www.siebspub.com/", img: "https://spoton-prod-websites-user-assets.s3.amazonaws.com/static/uploads/QB6xLV4yTWqbqxMBffcW_b697863b-b16c-42ab-9021-4c146e7694fd.jpg" },
  { spot: "Mola", style: "Seafood", website: "https://themolafish.com/", img: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&h=600&fit=crop" },
  { spot: "Del Friscos", style: "Steakhouse", website: "https://www.delfriscos.com/", img: "https://images.getbento.com/accounts/532b8149fcdb0e1cb7ac97b632998012/media/images/12477DEL_Boston_Seaport_Dining_Room_with_Wine_Wall_crop_1.jpeg?w=1800&fit=max&auto=compress,format&cs=origin&h=1800" },
  { spot: "The Filling Station", style: "Pub", website: "https://fillingstationmp.com/", img: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&fit=crop" },
  { spot: "La Cucina", style: "Italian", website: "https://pattislacucina.com/", img: "https://static.spotapps.co/website_images/ab_websites/168894_website_v1/video_poster.jpg" },
  { spot: "Garbarino's", style: "Italian", website: "https://garbarinos.com/", img: "https://garbarinos.com/assets/bg_pics/wall_art-33_1920x1280.jpg" },
  { spot: "Youngyinz", style: "Burgers", website: "https://youngyinz.toast.site/", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop" },
  { spot: "Buds Smokehouse", style: "BBQ", website: null, img: "https://images.unsplash.com/photo-1606502281004-f86cdb27d950?w=800&h=600&fit=crop" },
  { spot: "Totopo", style: "Mexican", website: "https://www.totopomex.com/", img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop" },
  { spot: "Grist House (Missle Command)", style: "Brewery", website: null, img: "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=800&h=600&fit=crop" },
  { spot: "3 Stone Merchant", style: "Gastropub", website: "https://threestonemerchant.com/", img: "https://static.spotapps.co/website_images/ab_websites/207273_website_v1/video_poster.jpg" },
  { spot: "Sforno", style: "Italian", website: "https://www.instagram.com/sfornojeannette/", img: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=800&h=600&fit=crop" },
  { spot: "Kira Revolving Sushi", style: "Sushi", website: "https://kurasushi.com/locations/pittsburgh-pa", img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop" },
  { spot: "Severinas", style: "Italian", website: "https://www.instagram.com/severina_pgh/?hl=en", img: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800&h=600&fit=crop" },
  { spot: "Lot 17", style: "American", website: "https://lot17pgh.com/", img: "https://static.spotapps.co/website_images/ab_websites/79360_website/video_poster.jpg" },
];

const MEMBERS = ["Kelli", "Jody", "Paula", "Mike"];

// Pre-existing ratings to migrate (from the hardcoded data)
// Garbarino's: FFFK = 3 Fucks + 1 Kill (assigned to members in order)
// Buds Smokehouse: KKKK = 4 Kills
const EXISTING_RATINGS: Record<string, string[]> = {
  "Garbarino's": ["fuck", "fuck", "fuck", "kill"],
  "Buds Smokehouse": ["kill", "kill", "kill", "kill"],
};

let seeding = false;

export async function seedDatabase() {
  // Prevent double-seeding from React Strict Mode
  if (seeding) return { seeded: false };
  seeding = true;

  // Check if already seeded
  const existingRestaurants = await getDocs(collection(db, 'restaurants'));
  if (!existingRestaurants.empty) {
    console.log('Database already seeded — skipping.');
    seeding = false;
    return { seeded: false };
  }

  console.log('Seeding database...');

  // Seed members
  const memberIds: Record<string, string> = {};
  for (const name of MEMBERS) {
    const docRef = await addDoc(collection(db, 'members'), {
      name,
      createdAt: serverTimestamp(),
    });
    memberIds[name] = docRef.id;
    console.log(`  Added member: ${name}`);
  }

  // Seed restaurants
  const restaurantIds: Record<string, string> = {};
  for (const r of RESTAURANTS) {
    const docRef = await addDoc(collection(db, 'restaurants'), {
      ...r,
      createdAt: serverTimestamp(),
    });
    restaurantIds[r.spot] = docRef.id;
    console.log(`  Added restaurant: ${r.spot}`);
  }

  // Seed existing ratings
  for (const [spotName, ratings] of Object.entries(EXISTING_RATINGS)) {
    const restaurantId = restaurantIds[spotName];
    for (let i = 0; i < ratings.length; i++) {
      const memberName = MEMBERS[i];
      const memberId = memberIds[memberName];
      await addDoc(collection(db, 'ratings'), {
        restaurantId,
        memberId,
        memberName,
        rating: ratings[i],
        notes: '',
        photos: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`  Added rating: ${memberName} → ${spotName} = ${ratings[i]}`);
    }
  }

  seeding = false;
  console.log('Seed complete!');
  return { seeded: true, restaurants: RESTAURANTS.length, members: MEMBERS.length };
}

export async function updateRestaurantImages() {
  console.log('Updating restaurant images...');
  const snapshot = await getDocs(collection(db, 'restaurants'));
  let updated = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const match = RESTAURANTS.find(r => r.spot === data.spot);
    if (match && match.img !== data.img) {
      await updateDoc(firestoreDoc(db, 'restaurants', docSnap.id), { img: match.img });
      console.log(`  Updated image: ${data.spot}`);
      updated++;
    }
  }

  console.log(`Image update complete! ${updated} restaurants updated.`);
  return { updated };
}

export async function resetDatabase() {
  console.log('Clearing all data...');
  await clearAllData();
  seeding = false;
  console.log('Reseeding...');
  return seedDatabase();
}
