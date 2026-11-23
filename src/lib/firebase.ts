import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";

import { isDemo } from "./mode";

const useEmulators = import.meta.env.DEV;

// Local development always uses the demo project, so it cannot reach production.
const app = initializeApp(
  useEmulators || isDemo
    ? {
        apiKey: "demo-api-key",
        authDomain: "demo-samfalligheten.firebaseapp.com",
        projectId: "demo-samfalligheten",
        storageBucket: "demo-samfalligheten.appspot.com",
      }
    : // Production. This config is public by design: it only names the project.
      // Access is controlled by the security rules, not by keeping these secret.
      {
        apiKey: "AIzaSyD5z2pP7Ed3ISnprDM9YWWxukqUK2YUfO4",
        authDomain: "samfalligheten-710db.firebaseapp.com",
        projectId: "samfalligheten-710db",
        // The Stockholm bucket (europe-north2), not the project's default one in Finland.
        storageBucket: "samfalligheten-710db-se",
        appId: "1:814367245320:web:c315f95718d786d20afdbd",
        messagingSenderId: "814367245320",
      },
);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "europe-north2");

if (useEmulators) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}
