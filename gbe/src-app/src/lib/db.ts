import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

// --- Types ---

export interface Member {
  id: string;
  name: string;
  createdAt: unknown;
}

export interface Restaurant {
  id: string;
  spot: string;
  style: string;
  website: string | null;
  img: string;
  createdAt: unknown;
}

export interface Rating {
  id: string;
  restaurantId: string;
  memberId: string;
  memberName: string;
  rating: 'marry' | 'fuck' | 'kill';
  notes: string;
  photos: string[];
  createdAt: unknown;
  updatedAt: unknown;
}

export type RatingValue = 'marry' | 'fuck' | 'kill';

// --- Members ---

export function subscribeMembers(callback: (members: Member[]) => void): Unsubscribe {
  const q = query(collection(db, 'members'), orderBy('name'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Member)));
  });
}

export async function addMember(name: string): Promise<string> {
  const docRef = await addDoc(collection(db, 'members'), {
    name,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateMember(id: string, name: string): Promise<void> {
  await updateDoc(doc(db, 'members', id), { name });
}

// --- Restaurants ---

export function subscribeRestaurants(callback: (restaurants: Restaurant[]) => void): Unsubscribe {
  const q = query(collection(db, 'restaurants'), orderBy('spot'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Restaurant)));
  });
}

export async function addRestaurant(data: {
  spot: string;
  style: string;
  website: string | null;
  img: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, 'restaurants'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateRestaurant(id: string, data: Partial<Omit<Restaurant, 'id'>>): Promise<void> {
  await updateDoc(doc(db, 'restaurants', id), data);
}

// --- Ratings ---

export function subscribeRatings(callback: (ratings: Rating[]) => void): Unsubscribe {
  const q = query(collection(db, 'ratings'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Rating)));
  });
}

export function subscribeRatingsForRestaurant(
  restaurantId: string,
  callback: (ratings: Rating[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'ratings'),
    where('restaurantId', '==', restaurantId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Rating)));
  });
}

export async function addRating(data: {
  restaurantId: string;
  memberId: string;
  memberName: string;
  rating: RatingValue;
  notes: string;
  photos: string[];
}): Promise<string> {
  const docRef = await addDoc(collection(db, 'ratings'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateRating(
  id: string,
  data: Partial<Pick<Rating, 'rating' | 'notes' | 'photos'>>
): Promise<void> {
  await updateDoc(doc(db, 'ratings', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRating(id: string): Promise<void> {
  await deleteDoc(doc(db, 'ratings', id));
}

// --- Clear All Data (for reseed) ---

export async function clearAllData(): Promise<void> {
  for (const colName of ['ratings', 'restaurants', 'members']) {
    const snap = await getDocs(collection(db, colName));
    await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, colName, d.id))));
  }
}

// --- Photo Upload ---

export async function uploadPhoto(file: File, restaurantId: string): Promise<string> {
  const filename = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `ratings/${restaurantId}/${filename}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadPhotos(files: File[], restaurantId: string): Promise<string[]> {
  return Promise.all(files.map((f) => uploadPhoto(f, restaurantId)));
}
