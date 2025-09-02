import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../store/auth.store";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const { signup, loading, error, roleChoice } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup(form);
    // after signup you may want to navigate to verify-email screen
    navigate("/verify-email");
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={submit} className="w-full max-w-md p-6 bg-white rounded-2xl shadow space-y-2">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-sm text-gray-500">Selected role: <span className="font-medium">{roleChoice ?? "none"}</span></p>
        <Input label="Name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />
        <Input label="Email" type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} required />
        <Input label="Password" type="password" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button disabled={loading} type="submit">{loading ? "Creating..." : "Sign up"}</Button>
        <p className="text-sm">Already have an account? <Link className="text-blue-600" to="/login">Login</Link></p>
      </form>
    </div>
  );
}
