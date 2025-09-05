import { useAuthStore } from "../store/auth.store";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Building, Plus, Eye } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-transparent backdrop-filter backdrop-blur-xl">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <img src="/logo.webp" alt="Logo" className="h-10 w-10" />
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400">Welcome back, {user?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-gray-300">Role: <span className="text-green-400 font-semibold">{user?.role}</span></p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Company Section - Only for company role users */}
        {user?.role === 'company' && (
          <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <Building className="w-8 h-8 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Company Management</h2>
            </div>
            
            <p className="text-gray-400 mb-6">
              Manage your company profile and information
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/company/create")}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-200"
              >
                <Plus className="w-5 h-5" />
                Create Company
              </button>
              
              <button
                onClick={() => navigate("/company/dashboard")}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition duration-200"
              >
                <Eye className="w-5 h-5" />
                View Company
              </button>
            </div>
          </div>
        )}

        {/* Client Section - For client role users */}
        {user?.role === 'client' && (
          <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Client Dashboard</h2>
            <p className="text-gray-400">
              Welcome to your client dashboard. Here you can browse companies and manage your profile.
            </p>
          </div>
        )}

        {/* General Features */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Profile</h3>
              <p className="text-gray-400 text-sm">Manage your account settings</p>
            </div>
            
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Security</h3>
              <p className="text-gray-400 text-sm">Update password and security settings</p>
            </div>
            
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Support</h3>
              <p className="text-gray-400 text-sm">Get help and contact support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
