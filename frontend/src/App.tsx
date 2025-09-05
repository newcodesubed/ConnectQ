import { Routes, Route, Navigate } from "react-router-dom";
import RoleSelect from "./pages/RoleSelect";
import SignUpPage from "./pages/Signup";
import LoginPage from "./pages/Login";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import CreateCompany from "./pages/CreateCompany";
import CompanyDashboard from "./pages/CompanyDashboard";
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="fixed inset-0 -z-10">

      <div className="relative h-full w-full bg-black"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div><div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fbfbfb36,#000)]"></div></div>
      </div>
      <div className="container mx-auto px-8">

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
          path="/company/create"
          element={
            <ProtectedRoute>
              <CreateCompany />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/dashboard"
          element={
            <ProtectedRoute>
              <CompanyDashboard />
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
    </div>
  );
};

export default App;

