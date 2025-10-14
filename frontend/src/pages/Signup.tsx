import { motion } from "framer-motion";
import Input from "../components/Input";
import { User, Mail, Lock, Loader, ArrowLeft, Building2, UserCheck } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import PasswordStrengthMeter from "../components/PasswordStrength";

export default function SignUpPage() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();
  const { signup, error, loading, roleChoice, loadRoleFromStorage } = useAuthStore();

  // Check for role selection on component mount
  useEffect(() => {
    // Load role from localStorage if not in memory
    loadRoleFromStorage();
    
    // If no role is selected, redirect to role selection page
    const storedRole = localStorage.getItem('roleChoice');
    if (!storedRole) {
      navigate('/role-select');
      return;
    }
  }, [navigate, loadRoleFromStorage]);

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    
    // Double-check role exists before signup
    if (!roleChoice) {
      navigate('/role-select');
      return;
    }

    try {
      await signup(email, password, name); // role will come from roleChoice in store
      navigate("/verify-email");
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeRole = () => {
    navigate('/role-select');
  };

  // Show loading spinner while checking role
  if (!roleChoice) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
    <header className="w-full py-6 px-8">
        <div className="flex items-center">
          <a href="/" className="flex items-center">
            <img
              src="/logo.webp"
              alt="ConnectQ"
              className="h-12 w-auto"
            />
          </a>
        </div>
      </header>
      <br />
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto w-full bg-[#F2F2F2] bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl"
    >
      <div className="p-8">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text mb-2">
          Create Account
        </h2>
        
        {/* Role Display */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {roleChoice === 'company' ? (
                <Building2 className="h-5 w-5 text-green-600" />
              ) : (
                <UserCheck className="h-5 w-5 text-green-600" />
              )}
              <div>
                <p className="text-sm font-medium text-green-800">
                  You are signing up as a {roleChoice === 'company' ? 'Company' : 'Client'}
                </p>
                <p className="text-xs text-green-600">
                  {roleChoice === 'company' 
                    ? 'Offering services to clients' 
                    : 'Looking to hire companies'}
                </p>
              </div>
            </div>
            <button
              onClick={handleChangeRole}
              className="text-xs text-green-700 hover:text-green-800 underline font-medium flex items-center space-x-1"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Change</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSignUp}>
          <Input
            icon={User}
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            icon={Mail}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-red-500 font-semibold mt-2">{error}</p>
          )}

          <PasswordStrengthMeter password={password} />

          <motion.button
            type="submit"
            className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
              font-bold rounded-lg shadow-lg hover:from-green-600
              hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
              focus:ring-offset-gray-900 transition duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <Loader className="animate-spin mx-auto" size={24} />
            ) : (
              "Sign Up"
            )}
          </motion.button>
        </form>
      </div>
      <div className="relative flex items-center">
      <div className="flex-grow border-t border-gray-300"></div>
      <span className="flex-shrink mx-3 text-gray-600 text-sm">or</span>
      <div className="flex-grow border-t border-gray-300"></div>
      </div>
      <div className="px-8 py-4 bg-opacity-50 flex justify-center rounded-b-2xl">
        <p className="text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-400 hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </motion.div>
    </div>
  );
}
