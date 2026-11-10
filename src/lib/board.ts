import { FirebaseError } from "firebase/app";
import { sendSignInLinkToEmail } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useEffect, useState } from "react";
import { auth, db, functions } from "./firebase";

export type Role = "admin" | "board";

export type BoardMember = {
  id: string;
  name: string;
  email: string;
  title: string;
  role: Role;
  showPublic: boolean;
  pending: boolean;
};

export function sendLoginLink(email: string) {
  return sendSignInLinkToEmail(auth, email, {
    url: `${window.location.origin}/logga-in`,
    handleCodeInApp: true,
  });
}

export function useBoardMembers() {
  const [members, setMembers] = useState<BoardMember[] | null>(null);

  useEffect(
    () =>
      onSnapshot(collection(db, "boardMembers"), (snapshot) => {
        const list = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as BoardMember);
        setMembers(list.sort((a, b) => a.name.localeCompare(b.name, "sv")));
      }),
    [],
  );

  return members;
}

export const inviteBoardMember = httpsCallable<
  { name: string; email: string; title: string; role: Role },
  { uid: string }
>(functions, "inviteBoardMember");

export const updateBoardMember = httpsCallable<
  { uid: string; title?: string; role?: Role; showPublic?: boolean },
  { uid: string }
>(functions, "updateBoardMember");

export const removeBoardMember = httpsCallable<{ uid: string }, { uid: string }>(
  functions,
  "removeBoardMember",
);

export function errorMessage(error: unknown) {
  const handled = ["already-exists", "failed-precondition", "invalid-argument", "not-found", "permission-denied"];
  if (error instanceof FirebaseError && handled.some((code) => error.code.endsWith(code))) {
    return error.message;
  }
  return "Något gick fel. Försök igen om en stund.";
}
