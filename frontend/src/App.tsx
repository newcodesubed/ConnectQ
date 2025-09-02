import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RoleSelect from "./pages/RoleSelect";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Protected from "./components/Protected";
import { useEffect } from "react";
import { useAuth } from "./store/auth.store";

export default function App() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth(); // try to restore session on app load
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/role" replace />} />
        <Route path="/role" element={<RoleSelect />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route path="*" element={<div className="p-6">Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
