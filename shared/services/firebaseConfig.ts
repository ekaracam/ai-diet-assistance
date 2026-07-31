/**
 * Firebase Configuration
 * Platform-agnostic — uses Firebase Web SDK (works on both Expo and Next.js)
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';

/**
 * Firebase config — env variable'lardan okunur.
 * 
 * Expo: EXPO_PUBLIC_FIREBASE_* prefix'i
 * Next.js: NEXT_PUBLIC_FIREBASE_* prefix'i
 * 
 * Hangi platform olursa olsun, bu fonksiyon doğru config'i bulur.
 */
const getFirebaseConfig = () => {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  };
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

/** Firebase uygulamasını başlat veya mevcut olanı döndür */
export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(getFirebaseConfig()) : getApp();
  }
  return app;
};

/** Firebase Auth instance'ını al */
export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
};

/** Firebase Auth instance'ını dışarıdan set et (örn. React Native AsyncStorage persistence için) */
export const setFirebaseAuth = (customAuth: Auth): void => {
  auth = customAuth;
};



/** Firestore instance'ını al */
export const getFirestoreDB = (): Firestore => {
  if (!db) {
    const app = getFirebaseApp();
    try {
      // Next.js (özellikle Windows ortamında) 'client is offline' hatasını önlemek için:
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    } catch (e) {
      // Eğer Firestore daha önceden başlatılmışsa (örn. hot reload), mevcudu al
      db = getFirestore(app);
    }
  }
  return db;
};

/** Firebase yapılandırılmış mı kontrol et */
export const isFirebaseConfigured = (): boolean => {
  const config = getFirebaseConfig();
  return !!(config.apiKey && config.projectId);
};
