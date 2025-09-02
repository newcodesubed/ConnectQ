import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import type { JSX } from "react";

type Props = { children: JSX.Element };

export default function Protected({ children }: Props) {
  const { user, loading } = useAuthStore();
  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
