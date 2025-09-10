import { useState, useEffect } from "react";
import { useAuthStore } from "../store/auth.store";
import { useCompanyStore } from "../store/companies.store";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import CompanyGetStartedPage from "./CompanyGetStartedPage";
import CompanyUpdatePage from "./CompanyUpdatePage";
import ClientGetStartedPage from "./ClientGetStartedPage";
import ClientUpdatePage from "./ClientUpdatePage";
import CompanyDashboard from "./CompanyDashboard";

type TabType = 'dashboard' | 'get-started' | 'manage-data';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const { company, getMyCompany } = useCompanyStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("get-started");
  
  // Check for company when component mounts (only for company users)
  useEffect(() => {
    if (user?.role === 'company') {
      getMyCompany();
    }
  }, [user?.role, getMyCompany]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const renderContent = () => {
    if (user?.role === 'company') {
      switch (activeTab) {
        case "get-started":
          return <CompanyGetStartedPage onViewProfile={() => setActiveTab("dashboard")} />;
        case "manage-data":
          return <CompanyUpdatePage onUpdateSuccess={() => setActiveTab("dashboard")} />;
        case "dashboard":
          // If no company exists, show redirect to get-started
          if (!company) {
            return (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <h3 className="text-xl font-semibold text-[#2D2D2D] mb-2">No Company Found</h3>
                <p className="text-gray-600 mb-6">
                  You need to create your company profile first before accessing the dashboard.
                </p>
                <button
                  onClick={() => setActiveTab("get-started")}
                  className="bg-[#fa744c] hover:bg-[#e8633f] text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Go to Get Started
                </button>
              </div>
            );
          }
          return <CompanyDashboard />;
        default:
          return <CompanyGetStartedPage onViewProfile={() => setActiveTab("dashboard")} />;
      }
    } else if (user?.role === 'client') {
      switch (activeTab) {
        case "get-started":
          return <ClientGetStartedPage />;
        case "manage-data":
          return <ClientUpdatePage />;
        case "dashboard":
        default:
          return <ClientGetStartedPage />;
      }
    }
    
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <h3 className="text-xl font-semibold text-[#2D2D2D] mb-2">Welcome to ConnectQ</h3>
        <p className="text-gray-600">
          Please use the sidebar to navigate through your dashboard.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <div className="p-6">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <img src="/logo.webp" alt="Logo" className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold text-[#2D2D2D]">ConnectQ</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-gray-500">Role: <span className="text-[#2D2D2D] font-semibold capitalize">{user?.role}</span></p>
            </div>
            <button
              onClick={handleLogout}
              className="text-[#2D2D2D] border-2 border-[#fa744c] px-6 py-2 rounded-lg hover:bg-[#fa744c] hover:text-white transition duration-200 font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        {renderContent()}
      </div>
    </div>
  );
}
