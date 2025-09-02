import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";

export default function Dashboard() {
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    // refresh on mount (optional, also can be done in App)
    if (!user) checkAuth();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2">Welcome, {user?.name}</p>
      <p className="text-sm text-gray-500">Role: {user?.role}</p>
    </div>
  );
}
