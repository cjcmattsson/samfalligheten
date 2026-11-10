import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { HttpsError, onCall, type CallableRequest } from "firebase-functions/v2/https";

initializeApp();
setGlobalOptions({ region: "europe-north1", maxInstances: 5 });

const boardMembers = () => getFirestore().collection("boardMembers");

const ROLES = ["admin", "board"] as const;
type Role = (typeof ROLES)[number];

// The document is checked instead of the token, so a removed or demoted admin stops at once.
async function requireAdmin(request: CallableRequest) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Du behöver logga in.");
  }
  const caller = await boardMembers().doc(request.auth.uid).get();
  if (caller.data()?.role !== "admin") {
    throw new HttpsError("permission-denied", "Bara administratörer kan göra det här.");
  }
}

function text(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim() || value.length > 200) {
    throw new HttpsError("invalid-argument", `${label} saknas eller är för långt.`);
  }
  return value.trim();
}

function role(value: unknown): Role {
  if (!ROLES.includes(value as Role)) {
    throw new HttpsError("invalid-argument", "Ogiltig roll.");
  }
  return value as Role;
}

async function adminCount(transaction: FirebaseFirestore.Transaction) {
  const admins = await transaction.get(boardMembers().where("role", "==", "admin"));
  return admins.size;
}

const LAST_ADMIN = "Föreningen måste ha minst en administratör.";

export const inviteBoardMember = onCall(async (request) => {
  await requireAdmin(request);
  const email = text(request.data?.email, "E-post").toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new HttpsError("invalid-argument", "Ogiltig e-postadress.");
  }
  const name = text(request.data?.name, "Namn");
  const title = text(request.data?.title, "Uppdrag");
  const newRole = role(request.data?.role);

  const auth = getAuth();
  const user = await auth.getUserByEmail(email).catch((error) => {
    if (error.code === "auth/user-not-found") return auth.createUser({ email });
    throw error;
  });

  const ref = boardMembers().doc(user.uid);
  if ((await ref.get()).exists) {
    throw new HttpsError("already-exists", "Personen finns redan i styrelsen.");
  }

  await auth.setCustomUserClaims(user.uid, { role: newRole });
  await ref.set({
    name,
    email,
    title,
    role: newRole,
    showPublic: false,
    pending: true,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { uid: user.uid };
});

export const updateBoardMember = onCall(async (request) => {
  await requireAdmin(request);
  const uid = text(request.data?.uid, "Användare");
  const changes: { title?: string; role?: Role; showPublic?: boolean } = {};
  if (request.data?.title !== undefined) changes.title = text(request.data.title, "Uppdrag");
  if (request.data?.role !== undefined) changes.role = role(request.data.role);
  if (typeof request.data?.showPublic === "boolean") changes.showPublic = request.data.showPublic;

  const ref = boardMembers().doc(uid);
  await getFirestore().runTransaction(async (transaction) => {
    const member = await transaction.get(ref);
    if (!member.exists) throw new HttpsError("not-found", "Personen finns inte i styrelsen.");
    const demoting = member.data()?.role === "admin" && changes.role === "board";
    if (demoting && (await adminCount(transaction)) <= 1) {
      throw new HttpsError("failed-precondition", LAST_ADMIN);
    }
    transaction.update(ref, changes);
  });

  if (changes.role) {
    await getAuth().setCustomUserClaims(uid, { role: changes.role });
  }
  return { uid };
});

export const removeBoardMember = onCall(async (request) => {
  await requireAdmin(request);
  const uid = text(request.data?.uid, "Användare");
  const ref = boardMembers().doc(uid);

  // Deleting the document comes first because the security rules stop access as soon as it is gone.
  await getFirestore().runTransaction(async (transaction) => {
    const member = await transaction.get(ref);
    if (!member.exists) throw new HttpsError("not-found", "Personen finns inte i styrelsen.");
    if (member.data()?.role === "admin" && (await adminCount(transaction)) <= 1) {
      throw new HttpsError("failed-precondition", LAST_ADMIN);
    }
    transaction.delete(ref);
  });

  const auth = getAuth();
  await auth.setCustomUserClaims(uid, null);
  await auth.revokeRefreshTokens(uid);
  await auth.deleteUser(uid);
  return { uid };
});
