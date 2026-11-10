import { execFileSync } from "node:child_process";
import { deleteApp, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { connectFirestoreEmulator, doc, getDoc, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const projectId = "demo-samfalligheten";
const authHost = "http://127.0.0.1:9099";
const password = "test-password";
const apps: FirebaseApp[] = [];

async function setPassword(uid: string) {
  const response = await fetch(
    `${authHost}/identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:update`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer owner" },
      body: JSON.stringify({ localId: uid, password }),
    },
  );
  expect(response.ok).toBe(true);
}

async function client(email?: string) {
  const app = initializeApp({ apiKey: "demo", projectId }, `app-${apps.length}`);
  apps.push(app);
  const auth = getAuth(app);
  connectAuthEmulator(auth, authHost, { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  const functions = getFunctions(app, "europe-north1");
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  if (email) await signInWithEmailAndPassword(auth, email, password);
  return {
    auth,
    db,
    call: (name: string, data: unknown) => httpsCallable(functions, name)(data),
  };
}

function createAdmin(email: string, name: string) {
  return execFileSync("node", ["functions/scripts/create-admin.mjs", email, name], {
    encoding: "utf8",
  }).trim();
}

const adminEmail = "admin@example.com";
let adminUid: string;
let admin: Awaited<ReturnType<typeof client>>;

async function invite(email: string, role = "board") {
  const result = await admin.call("inviteBoardMember", { email, name: "Test", title: "Ledamot", role });
  const { uid } = result.data as { uid: string };
  await setPassword(uid);
  return uid;
}

beforeAll(async () => {
  adminUid = createAdmin(adminEmail, "Test Admin");
  await setPassword(adminUid);
  admin = await client(adminEmail);
});

afterAll(async () => {
  await Promise.all(apps.map(deleteApp));
});

describe("board member functions", () => {
  it("rejects anonymous callers", async () => {
    const anonymous = await client();
    await expect(
      anonymous.call("inviteBoardMember", { email: "x@example.com", name: "X", title: "X", role: "board" }),
    ).rejects.toMatchObject({ code: "functions/unauthenticated" });
  });

  it("lets an admin invite someone, who can then read the board", async () => {
    const uid = await invite("ledamot@example.com");
    const member = await client("ledamot@example.com");
    const snapshot = await getDoc(doc(member.db, "boardMembers", uid));
    expect(snapshot.data()?.pending).toBe(true);
    const token = await member.auth.currentUser!.getIdTokenResult(true);
    expect(token.claims.role).toBe("board");
  });

  it("does not let a regular board member invite, update or remove", async () => {
    const uid = await invite("vanlig@example.com");
    const member = await client("vanlig@example.com");
    const denied = { code: "functions/permission-denied" };
    await expect(
      member.call("inviteBoardMember", { email: "y@example.com", name: "Y", title: "Y", role: "admin" }),
    ).rejects.toMatchObject(denied);
    await expect(member.call("updateBoardMember", { uid, role: "admin" })).rejects.toMatchObject(denied);
    await expect(member.call("removeBoardMember", { uid: adminUid })).rejects.toMatchObject(denied);
  });

  it("rejects inviting the same person twice", async () => {
    await invite("dubbel@example.com");
    await expect(
      admin.call("inviteBoardMember", { email: "dubbel@example.com", name: "T", title: "T", role: "board" }),
    ).rejects.toMatchObject({ code: "functions/already-exists" });
  });

  it("stops a removed member immediately, even with a valid token", async () => {
    const uid = await invite("borttagen@example.com");
    const member = await client("borttagen@example.com");
    await getDoc(doc(member.db, "boardMembers", uid));
    await admin.call("removeBoardMember", { uid });
    await expect(getDoc(doc(member.db, "boardMembers", adminUid))).rejects.toMatchObject({
      code: "permission-denied",
    });
  });

  it("never allows the last admin to be demoted or removed", async () => {
    const failed = { code: "functions/failed-precondition" };
    await expect(admin.call("updateBoardMember", { uid: adminUid, role: "board" })).rejects.toMatchObject(failed);
    await expect(admin.call("removeBoardMember", { uid: adminUid })).rejects.toMatchObject(failed);
  });
});
