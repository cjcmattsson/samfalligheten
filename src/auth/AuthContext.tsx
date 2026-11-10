import { deleteUser, onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, onSnapshot, updateDoc, type FirestoreError } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { Outlet } from "react-router";
import type { BoardMember } from "../lib/board";
import { auth, db } from "../lib/firebase";

type AuthState =
  | { status: "loading" }
  | { status: "signedOut"; denied: boolean }
  | { status: "signedIn"; member: BoardMember };

const AuthContext = createContext<AuthState>({ status: "loading" });

// Someone not on the board can still finish an email link. Their account is removed
// straight away, so the association does not keep the address of an outsider.
async function rejectUser(user: User) {
  const token = await user.getIdTokenResult().catch(() => null);
  if (token && !token.claims.role) {
    await deleteUser(user).catch(() => signOut(auth));
  } else {
    await signOut(auth);
  }
}

// Rendered only around the login page and the portal, so public visitors never load a session.
export function AuthBoundary() {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let stopMember = () => {};
    let denied = false;

    const stopAuth = onAuthStateChanged(auth, (user) => {
      stopMember();
      if (!user) {
        setState({ status: "signedOut", denied });
        return;
      }

      function deny() {
        denied = true;
        stopMember();
        void rejectUser(user!);
      }

      setState({ status: "loading" });
      denied = false;
      stopMember = onSnapshot(
        doc(db, "boardMembers", user.uid),
        (snapshot) => {
          if (!snapshot.exists()) {
            deny();
            return;
          }
          const member = { id: snapshot.id, ...snapshot.data() } as BoardMember;
          setState({ status: "signedIn", member });
          if (member.pending) void updateDoc(snapshot.ref, { pending: false }).catch(() => {});
        },
        (error: FirestoreError) => {
          if (error.code === "permission-denied") deny();
          else setState({ status: "signedOut", denied: false });
        },
      );
    });

    return () => {
      stopMember();
      stopAuth();
    };
  }, []);

  return (
    <AuthContext.Provider value={state}>
      <Outlet />
    </AuthContext.Provider>
  );
}

export function useAuthState() {
  return useContext(AuthContext);
}

// For components rendered inside RequireBoard, where a member always exists.
export function useMember() {
  const state = useAuthState();
  if (state.status !== "signedIn") throw new Error("useMember must be used inside RequireBoard");
  return state.member;
}
