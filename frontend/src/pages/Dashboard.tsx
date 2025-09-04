import { useAuthStore } from "../store/auth.store";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  

  return (
    <div className="flex mx-auto w-full min-h-screen">
      <Toaster position="top-right" />
      <div className="flex w-full mb-6">
      <div className="flex align-items-center w-full mb-6">
        <img src="/logo.webp
        " alt="Logo" className="h-10 w-10" />
        <p className="mt-2 text-stone-200">Welcome, {user?.name}</p>
        <p className="text-sm text-gray-500">Role: {user?.role}</p>
      </div>
      <h1 className="text-2xl text-stone-200 font-bold">Dashboard</h1>
      
      </div>
      <div >

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
        Logout
      </button>
        </div>
    </div>
  );
}
