import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Initialize Firebase safely for SSR/Client
export const app: FirebaseApp | null =
  getApps().length > 0
    ? getApp()
    : firebaseConfig.apiKey
    ? initializeApp(firebaseConfig)
    : null;

export const storage: FirebaseStorage | null = app ? getStorage(app) : null;

// Initialize Analytics conditionally in browser
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined" && app) {
  isSupported().then((supported) => {
    if (supported && app) {
      analytics = getAnalytics(app);
    }
  });
}

export default app;
