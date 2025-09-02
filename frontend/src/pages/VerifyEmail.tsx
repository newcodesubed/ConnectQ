import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../store/auth.store";

export default function VerifyEmail() {
  const { verifyEmail, loading, error } = useAuth();
  const [code, setCode] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyEmail(code);
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={submit} className="w-full max-w-md p-6 bg-white rounded-2xl shadow space-y-2">
        <h1 className="text-2xl font-bold">Verify Email</h1>
        <Input label="Code" value={code} onChange={(e)=>setCode(e.target.value)} placeholder="Enter 6-digit code" required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button disabled={loading} type="submit">{loading ? "Verifying..." : "Verify"}</Button>
      </form>
    </div>
  );
}
