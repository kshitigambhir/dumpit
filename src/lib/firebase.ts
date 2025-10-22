import { isSupported as analyticsSupported, getAnalytics } from "firebase/analytics";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Read config from Next.js env. These should be set in your .env as NEXT_PUBLIC_FIREBASE_*
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate required keys
const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"] as const;
const missing = requiredKeys.filter((k) => !(firebaseConfig as any)[k]);
const isDummyConfig =
  missing.length > 0 ||
  firebaseConfig.apiKey?.includes("Dummy") ||
  firebaseConfig.apiKey?.includes("dummy");

if (isDummyConfig) {
  // eslint-disable-next-line no-console
  console.warn(
    "⚠️  Firebase configuration is incomplete or using dummy values.\n" +
      "Please add NEXT_PUBLIC_FIREBASE_* environment variables to your .env.local file.\n" +
      "See FIREBASE_SETUP.md for instructions."
  );
}

// --- SSR-SAFE INITIALIZATION --- //
const app =
  typeof window !== "undefined"
    ? !getApps().length
      ? initializeApp(firebaseConfig as any)
      : getApp()
    : null;

// Lazy getters — safe for SSR
export const getFirebaseAuth = () => (app ? getAuth(app) : null);
export const getFirebaseDb = () => (app ? getFirestore(app) : null);

// Compatibility exports for existing imports (old code)
export const auth = getFirebaseAuth();
export const db = getFirebaseDb();

// Guard analytics initialization: it will fail in SSR or if measurementId is not provided
(async () => {
  try {
    if (firebaseConfig.measurementId && typeof window !== "undefined" && app) {
      const ok = await analyticsSupported();
      if (ok) {
        getAnalytics(app);
      }
    }
  } catch (err) {
    // Not fatal — analytics optional
    // eslint-disable-next-line no-console
    console.warn("Firebase analytics not available:", err);
  }
})();

export default app;