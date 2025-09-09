import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";
import { useCompanyStore } from "../store/companies.store";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Building, Plus, Eye, MapPin, Users, Calendar, ExternalLink, Linkedin, Twitter } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const { company, getMyCompany } = useCompanyStore();
  const navigate = useNavigate();
  
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <img src="/logo.webp" alt="Logo" className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold text-[#2D2D2D]">Dashboard</h1>
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

        {/* Company Section - Only for company role users */}
        {user?.role === 'company' && (
          <div className="mb-8">
            {!company ? (
              // Show Create Company Button when no company exists
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="mb-8">
                    <div className="w-32 h-32 mx-auto bg-[#fa744c] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
                      <Plus className="w-16 h-16 text-[#fa744c]" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#2D2D2D] mb-4">Create Your Company</h2>
                    <p className="text-gray-600 text-lg mb-8">
                      Get started by creating your company profile to showcase your services and connect with clients.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => navigate("/company/create")}
                    className="w-full bg-[#fa744c] hover:bg-[#e8633f] text-white font-semibold py-4 px-8 rounded-xl transition duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <Building className="w-6 h-6" />
                      Create Company Profile
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              // Show Company Details when company exists
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {company.logoUrl && (
                      <img
                        src={company.logoUrl}
                        alt={`${company.name} logo`}
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-[#2D2D2D]">{company.name}</h2>
                      {company.tagline && (
                        <p className="text-[#fa744c] italic text-lg">"{company.tagline}"</p>
                      )}
                      {company.industry && (
                        <p className="text-gray-600">{company.industry}</p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigate("/company/dashboard")}
                    className="bg-[#fa744c] hover:bg-[#e8633f] text-white px-6 py-3 rounded-lg transition duration-200 flex items-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    View Full Profile
                  </button>
                </div>

                {/* Company Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {company.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-2 text-[#fa744c]" />
                      <span>{company.location}</span>
                    </div>
                  )}
                  {company.employeeCount && (
                    <div className="flex items-center text-gray-600">
                      <Users className="w-5 h-5 mr-2 text-[#fa744c]" />
                      <span>{company.employeeCount} employees</span>
                    </div>
                  )}
                  {company.foundedAt && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-2 text-[#fa744c]" />
                      <span>Founded {new Date(company.foundedAt).getFullYear()}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {company.description && (
                  <div className="mb-6">
                    <p className="text-gray-700 leading-relaxed">{company.description}</p>
                  </div>
                )}

                {/* Services Preview */}
                {company.services && company.services.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-[#2D2D2D] mb-3">Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {company.services.slice(0, 6).map((service, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {service}
                        </span>
                      ))}
                      {company.services.length > 6 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                          +{company.services.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Links */}
                <div className="flex gap-4">
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-[#fa744c] hover:text-[#e8633f] transition duration-200"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Website
                    </a>
                  )}
                  {company.linkedinUrl && (
                    <a
                      href={company.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 transition duration-200"
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </a>
                  )}
                  {company.twitterUrl && (
                    <a
                      href={company.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sky-500 hover:text-sky-700 transition duration-200"
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Client Section - For client role users */}
        {user?.role === 'client' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">Client Dashboard</h2>
            <p className="text-gray-600 mb-6">
              Welcome to your client dashboard. Here you can browse companies and manage your profile.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-[#2D2D2D] mb-2">Browse Companies</h3>
                <p className="text-gray-600 text-sm">Discover companies that match your project needs</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-[#2D2D2D] mb-2">Saved Companies</h3>
                <p className="text-gray-600 text-sm">View your saved and favorite company profiles</p>
              </div>
            </div>
          </div>
        )}

        {/* General Features */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg hover:border-[#fa744c] transition duration-200">
              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-2">Profile</h3>
              <p className="text-gray-600 text-sm">Manage your account settings and personal information</p>
            </div>
            
            <div className="p-6 border border-gray-200 rounded-lg hover:border-[#fa744c] transition duration-200">
              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-2">Security</h3>
              <p className="text-gray-600 text-sm">Update password and security settings</p>
            </div>
            
            <div className="p-6 border border-gray-200 rounded-lg hover:border-[#fa744c] transition duration-200">
              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-2">Support</h3>
              <p className="text-gray-600 text-sm">Get help and contact our support team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
