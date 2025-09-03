import { Routes, Route, Navigate } from "react-router-dom";
import RoleSelect from "./pages/RoleSelect";
import SignUpPage from "./pages/Signup";
import LoginPage from "./pages/Login";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import { type ReactNode, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/auth.store";
import LoadingSpinner from "./components/LoadingSpinner";
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};

// --- RedirectAuthenticated Component ---
interface RedirectAuthenticatedProps {
  children: ReactNode;
}

const RedirectAuthenticated: React.FC<RedirectAuthenticatedProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  return isAuthenticated && user?.isVerified ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};


const App: React.FC = () => {
  const { loading: isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <div
      className="min-h-screen bg-gradient-to-br
                 from-gray-900 via-green-900 to-emerald-900
                 flex items-center justify-center relative overflow-hidden"
    >
      
      <Routes>
        <Route path="/" element={<Navigate to="/role" replace />} />
       <Route path="/role" element={<RoleSelect />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectAuthenticated>
              <LoginPage />
            </RedirectAuthenticated>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectAuthenticated>
              <SignUpPage />
            </RedirectAuthenticated>
          }
        />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/forgot-password"
          element={
            <RedirectAuthenticated>
              <ForgotPasswordPage />
            </RedirectAuthenticated>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <RedirectAuthenticated>
              <ResetPasswordPage />
            </RedirectAuthenticated>
          }
        />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;

