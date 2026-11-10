import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const useEmulators = import.meta.env.DEV;

// Local development always uses the demo project, so it cannot reach production.
const app = initializeApp(
  useEmulators
    ? {
        apiKey: "demo-api-key",
        authDomain: "demo-ostergardshus.firebaseapp.com",
        projectId: "demo-ostergardshus",
        storageBucket: "demo-ostergardshus.appspot.com",
      }
    : {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      },
);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

if (useEmulators) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}
