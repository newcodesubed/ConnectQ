import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../store/auth.store";

export default function ForgotPassword() {
  const { forgotPassword, loading, error } = useAuth();
  const [email, setEmail] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await forgotPassword(email);
    alert("If the email exists, a reset link has been sent.");
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={submit} className="w-full max-w-md p-6 bg-white rounded-2xl shadow space-y-2">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <Input label="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button disabled={loading} type="submit">{loading ? "Sending..." : "Send reset link"}</Button>
      </form>
    </div>
  );
}
