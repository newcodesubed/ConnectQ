import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../store/auth.store";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(form);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={submit} className="w-full max-w-md p-6 bg-white rounded-2xl shadow space-y-2">
        <h1 className="text-2xl font-bold">Login</h1>
        <Input label="Email" type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} required />
        <Input label="Password" type="password" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button disabled={loading} type="submit">{loading ? "Logging in..." : "Login"}</Button>
        <p className="text-sm">
          <Link className="text-blue-600" to="/forgot-password">Forgot password?</Link>
        </p>
      </form>
    </div>
  );
}
