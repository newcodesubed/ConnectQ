import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../store/auth.store";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, loading, error } = useAuth();
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    await resetPassword(token, password);
    alert("Password reset successful");
    navigate("/login");
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={submit} className="w-full max-w-md p-6 bg-white rounded-2xl shadow space-y-2">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <Input label="New Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button disabled={loading} type="submit">{loading ? "Resetting..." : "Reset password"}</Button>
      </form>
    </div>
  );
}
