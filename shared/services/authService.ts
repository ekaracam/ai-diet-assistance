/**
 * Firebase Authentication Service
 * Email/password based auth with Firebase Web SDK
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebaseConfig';
import { saveUserProfile } from './firestoreService';
import { DEFAULT_FORM_DATA } from '../types/user';

export type { User };

/** Yeni kullanıcı kaydı */
export const signUp = async (
  email: string,
  password: string,
  displayName?: string
): Promise<User> => {
  const auth = getFirebaseAuth();
  const result = await createUserWithEmailAndPassword(auth, email, password);

  if (displayName) {
    await updateProfile(result.user, { displayName });
  }

  // Kayıt sırasında temel bilgileri Firestore'a kaydet
  try {
    await saveUserProfile(result.user.uid, {
      ...DEFAULT_FORM_DATA,
      name: displayName || '',
      email: email,
    });
  } catch (error) {
    console.error('Error saving initial profile:', error);
  }

  return result.user;
};

/** E-posta/şifre ile giriş */
export const signIn = async (
  email: string,
  password: string
): Promise<User> => {
  const auth = getFirebaseAuth();
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

/** Çıkış yap */
export const signOut = async (): Promise<void> => {
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
};

/** Mevcut kullanıcıyı al */
export const getCurrentUser = (): User | null => {
  const auth = getFirebaseAuth();
  return auth.currentUser;
};

/** Auth state değişikliğini dinle */
export const onAuthChange = (callback: (user: User | null) => void): Unsubscribe => {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
};
