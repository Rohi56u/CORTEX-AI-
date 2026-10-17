import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getStorage, FirebaseStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

export const app: FirebaseApp | null =
  getApps().length > 0
    ? getApp()
    : firebaseConfig.apiKey
    ? initializeApp(firebaseConfig)
    : null;

export const storage: FirebaseStorage | null = app ? getStorage(app) : null;

export default app;
