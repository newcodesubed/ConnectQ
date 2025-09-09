import { useState, useEffect, useRef, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import toast from "react-hot-toast";

function EmailVerificationPage() {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { verifyEmail, error, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (index: number, value: string) => {
    const newCode = [...code];

    // Handle pasted content
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);

      // Focus on the last non-empty input or the first empty one
      const lastFilledIndex = newCode.length - 1 - newCode.slice().reverse().findIndex(digit => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      // Move focus to the next input field if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');
    try {
      await verifyEmail(verificationCode);
      if (!error) {
        navigate("/dashboard");
        toast.success("Email verified successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Auto submit when all fields are filled
  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      const verificationCode = code.join('');
      verifyEmail(verificationCode).then(() => {
        if (!error) {
          navigate("/dashboard");
          toast.success("Email verified successfully");
        }
      }).catch((error) => {
        console.log(error);
      });
    }
  }, [code, verifyEmail, error, navigate]);

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-[#2D2D2D]">
          Verify Your Email
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Enter the 6-digit code sent to your email address.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-2xl font-bold bg-white text-[#2D2D2D] border-2 border-gray-300 rounded-lg focus:border-[#fa744c] focus:ring-2 focus:ring-[#fa744c] focus:ring-opacity-20 focus:outline-none transition duration-200"
              />
            ))}
          </div>
          
          {error && (
            <p className="text-red-500 font-semibold text-sm text-center">{error}</p>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || code.some((digit) => !digit)}
            className="w-full bg-[#fa744c] text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:bg-[#e8633f] focus:outline-none focus:ring-2 focus:ring-[#fa744c] focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Verifying...
              </div>
            ) : (
              "Verify Email"
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Didn&apos;t receive the code?{" "}
            <Link to="/signup" className="text-[#fa744c] hover:text-[#e8633f] font-medium underline">
              Resend Code
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default EmailVerificationPage;
