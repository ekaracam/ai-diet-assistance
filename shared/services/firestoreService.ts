/**
 * Firestore Service — CRUD operations for user data
 */

import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreDB } from './firebaseConfig';
import type { UserFormData, HistoryEntry } from '../types/user';
import type { WeeklyDietPlan } from '../types/diet';

// ─── User Profile ───

/** Kullanıcı profil verilerini kaydet */
export const saveUserProfile = async (
  userId: string,
  data: UserFormData
): Promise<void> => {
  const db = getFirestoreDB();
  await setDoc(doc(db, 'users', userId), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

/** Kullanıcı profil verilerini getir */
export const getUserProfile = async (
  userId: string
): Promise<UserFormData | null> => {
  const db = getFirestoreDB();
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return snap.data() as UserFormData;
};

// ─── History ───

/**
 * Geçmiş kaydını yaz (aynı gün için üzerine yazar).
 *
 * Doküman kimliği YYYY-MM-DD — böylece kullanıcı gün içinde kilosunu birkaç kez
 * güncellese de o güne ait tek kayıt kalır ve yerel store'daki "gün başına bir
 * kayıt" davranışıyla birebir örtüşür.
 */
export const saveHistoryEntry = async (
  userId: string,
  entry: Omit<HistoryEntry, 'id'>
): Promise<void> => {
  const db = getFirestoreDB();
  const dayKey = entry.date.split('T')[0];
  await setDoc(doc(db, 'users', userId, 'history', dayKey), {
    ...entry,
    updatedAt: serverTimestamp(),
  });
};

/** Geçmiş kayıtlarını eskiden yeniye sıralı getir */
export const getHistoryEntries = async (
  userId: string,
  maxEntries = 90
): Promise<HistoryEntry[]> => {
  const db = getFirestoreDB();
  const q = query(
    collection(db, 'users', userId, 'history'),
    orderBy('date', 'desc'),
    limit(maxEntries)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as HistoryEntry)).reverse();
};

// ─── Diet Plans ───

/** Haftalık diyet planını kaydet (mevcut planı günceller/üzerine yazar) */
export const saveWeeklyDietPlan = async (
  userId: string,
  plan: WeeklyDietPlan,
  startDate: string
): Promise<void> => {
  const db = getFirestoreDB();
  await setDoc(doc(db, 'users', userId, 'dietPlans', 'current_weekly'), {
    plan,
    startDate,
    updatedAt: serverTimestamp(),
  });
};

/** Haftalık diyet planını getir */
export const getWeeklyDietPlan = async (
  userId: string
): Promise<{ plan: WeeklyDietPlan; startDate: string } | null> => {
  const db = getFirestoreDB();
  const snap = await getDoc(doc(db, 'users', userId, 'dietPlans', 'current_weekly'));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    plan: data.plan as WeeklyDietPlan,
    startDate: data.startDate as string,
  };
};

// NOT: Sohbet geçmişi ve tekil diyet planı arşivi için buradaki CRUD fonksiyonları
// yazılmış ama hiçbir ekrandan çağrılmadığı için kaldırıldı (ölü kod).
// Sohbet geçmişi şu an bilinçli olarak yalnızca cihazda tutuluyor
// (shared/store/useChatStore.ts). Buluta taşınacaksa firestore.rules içindeki
// users/{uid}/chatSessions kuralı zaten hazır.
