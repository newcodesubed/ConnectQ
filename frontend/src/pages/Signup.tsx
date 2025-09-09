import { motion } from "framer-motion";
import Input from "../components/Input";
import { User, Mail, Lock, Loader } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import PasswordStrengthMeter from "../components/PasswordStrength";

export default function SignUpPage() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();
  const { signup, error, loading } = useAuthStore();

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signup(email, password, name); // role will come from roleChoice in store
      navigate("/verify-email");
    } catch (err) {
      console.error(err);
    }
  };

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
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text mb-6">
          Create Account
        </h2>

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
