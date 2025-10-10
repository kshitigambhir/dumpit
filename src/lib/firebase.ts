import { isSupported as analyticsSupported, getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Read config from Vite env (recommended). These should be set in your .env as VITE_FIREBASE_*
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate required keys and fail fast with a helpful message
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
const missing = requiredKeys.filter((k) => !(firebaseConfig as any)[k]);
if (missing.length) {
  // eslint-disable-next-line no-console
  console.error('Firebase configuration missing keys:', missing.join(', '));
  throw new Error('Firebase configuration incomplete. Add VITE_FIREBASE_* values to your .env and restart the dev server.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig as any);
export const auth = getAuth(app);

// Guard analytics initialization: it will fail in SSR or if measurementId is not provided
(async () => {
  try {
    if (firebaseConfig.measurementId && typeof window !== 'undefined') {
      const ok = await analyticsSupported();
      if (ok) {
        getAnalytics(app);
      }
    }
  } catch (err) {
    // Not fatal — analytics optional, but surface the error to console for debugging
    // eslint-disable-next-line no-console
    console.warn('Firebase analytics not available:', err);
  }
})();

export default app;
