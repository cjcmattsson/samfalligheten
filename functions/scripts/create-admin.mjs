// Creates the first administrator, since nobody else can send the first invitation.
//
// Local emulators:  node functions/scripts/create-admin.mjs <email> "<name>"
// Production, once: node functions/scripts/create-admin.mjs <email> "<name>" --production
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const args = process.argv.slice(2);
const production = args.includes("--production");
const [email, name] = args.filter((arg) => arg !== "--production");

if (!email || !name) {
  console.error('Usage: create-admin.mjs <email> "<name>" [--production]');
  process.exit(1);
}

if (!production) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
  process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
  process.env.GCLOUD_PROJECT ??= "demo-samfalligheten";
}

if (!getApps().length) initializeApp({ projectId: process.env.GCLOUD_PROJECT });

const auth = getAuth();
const address = email.toLowerCase();
const user = await auth.getUserByEmail(address).catch((error) => {
  if (error.code === "auth/user-not-found") return auth.createUser({ email: address });
  throw error;
});

await auth.setCustomUserClaims(user.uid, { role: "admin" });
await getFirestore().collection("boardMembers").doc(user.uid).set({
  name,
  email: address,
  title: "Ordförande",
  role: "admin",
  showPublic: false,
  pending: true,
  createdAt: FieldValue.serverTimestamp(),
});

console.log(user.uid);
