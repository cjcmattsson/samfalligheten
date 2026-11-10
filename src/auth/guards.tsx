import { Navigate, Outlet } from "react-router";
import { LoadingScreen } from "../components/ui";
import { useAuthState, useMember } from "./AuthContext";

export function RequireBoard() {
  const state = useAuthState();
  if (state.status === "loading") return <LoadingScreen />;
  if (state.status === "signedOut") return <Navigate to="/logga-in" replace />;
  return <Outlet />;
}

export function RequireAdmin() {
  const member = useMember();
  if (member.role !== "admin") return <Navigate to="/portal" replace />;
  return <Outlet />;
}
