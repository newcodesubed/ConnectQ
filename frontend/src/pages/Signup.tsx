// import { useState } from "react";
// import Input from "../components/Input";
// import Button from "../components/Button";
// import { useAuthStore } from "../store/auth.store";
// import { Link, useNavigate } from "react-router-dom";

// export default function Signup() {
//   const { signup, loading, error, roleChoice } = useAuthStore();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ name: "", email: "", password: "" });

//   const submit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     await signup(form);
//     // after signup you may want to navigate to verify-email screen
//     navigate("/verify-email");
//   };

//   return (
//     <div className="min-h-screen grid place-items-center">
//       <form onSubmit={submit} className="w-full max-w-md p-6 bg-white rounded-2xl shadow space-y-2">
//         <h1 className="text-2xl font-bold">Create account</h1>
//         <p className="text-sm text-gray-500">Selected role: <span className="font-medium">{roleChoice ?? "none"}</span></p>
//         <Input label="Name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />
//         <Input label="Email" type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} required />
//         <Input label="Password" type="password" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} required />
//         {error && <p className="text-red-600 text-sm">{error}</p>}
//         <Button disabled={loading} type="submit">{loading ? "Creating..." : "Sign up"}</Button>
//         <p className="text-sm">Already have an account? <Link className="text-blue-600" to="/login">Login</Link></p>
//       </form>
//     </div>
//   );
// }
import { motion } from "framer-motion";
import Input from "../components/Input";
import { User, Mail, Lock, Loader } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
// import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useAuthStore } from "../store/auth.store";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl"
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

          {/* <PasswordStrengthMeter password={password} /> */}

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

      <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center rounded-b-2xl">
        <p className="text-sm text-gray-400">
          Already have an account?
          <Link
            to="/login"
            className="text-green-400 hover:text-green-800 ml-1"
          >
            Log In
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
