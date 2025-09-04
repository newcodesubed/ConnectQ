import { useAuthStore } from "../store/auth.store";
import { useNavigate } from "react-router-dom";

export default function RoleSelect() {
  const { setRoleChoice, roleChoice } = useAuthStore();
  const navigate = useNavigate();

  const choose = (role: "client" | "company") => {
    setRoleChoice(role);
    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-4 p-6 bg-white rounded-2xl shadow">
        <h1 className="text-2xl font-bold text-center">Who are you?</h1>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => choose("client")} className={`p-4 rounded-2xl border ${roleChoice==="client" ? "ring-2 ring-blue-500" : ""}`}>
            Client
          </button>
          <button onClick={() => choose("company")} className={`p-4 rounded-2xl border ${roleChoice==="company" ? "ring-2 ring-blue-500" : ""}`}>
            Company
          </button>
        </div>
        <p className="text-sm text-gray-500 text-center">You can change before submitting signup.</p>
      </div>
    </div>
  );
}