import { useState } from "react";
import { useAuthStore } from "../store/auth.store";
import { useNavigate } from "react-router-dom";

export default function RoleSelect() {
  const { setRoleChoice } = useAuthStore();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<"client" | "company" | null>(null);

  const handleCreateAccount = () => {
    if (selectedType) {
      setRoleChoice(selectedType);
      navigate("/signup");
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full py-6 px-8">
        <div className="flex items-center">
          <a href="/" className="flex items-center">
            <img
              src="/logo.webp"
              alt="ConnectQ"
              className="h-12 w-auto"
            />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center px-4 pt-16 pb-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-16 leading-tight">
              Join as a client or company
            </h1>

            {/* Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
              {/* Client Card */}
              <div
                className={`relative border-2 rounded-2xl p-12 cursor-pointer transition-all duration-300 min-h-[280px] flex flex-col justify-center ${
                  selectedType === 'client'
                    ? 'border-[#66BB6A] bg-orange-50/30'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
                onClick={() => setSelectedType('client')}
              >
                <div className="absolute top-6 right-6">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    selectedType === 'client'
                      ? 'border-[#66BB6A] bg-[#66BB6A]'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {selectedType === 'client' && (
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <div className="mb-8">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#66BB6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-normal text-gray-900 leading-relaxed px-4">
                    I'm a client, hiring for a project
                  </h3>
                </div>
              </div>

              {/* Company Card */}
              <div
                className={`relative border-2 rounded-2xl p-12 cursor-pointer transition-all duration-300 min-h-[280px] flex flex-col justify-center ${
                  selectedType === 'company'
                    ? 'border-[#66BB6A] bg-orange-50/30'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
                onClick={() => setSelectedType('company')}
              >
                <div className="absolute top-6 right-6">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    selectedType === 'company'
                      ? 'border-[#66BB6A] bg-[#66BB6A]'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {selectedType === 'company' && (
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <div className="mb-8">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#66BB6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-normal text-gray-900 leading-relaxed px-4">
                    I'm a company, offering services
                  </h3>
                </div>
              </div>
            </div>

            {/* Create Account Button */}
            <div className="space-y-6">
                <button
                disabled={!selectedType}
                onClick={handleCreateAccount}
                className={`w-full max-w-xs mx-auto block px-10 py-4 rounded-full text-lg font-medium transition-all duration-300 ${
                  selectedType
                  ? 'bg-[#66BB6A] hover:bg-[#4fb654] text-white cursor-pointer shadow-sm hover:shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                >
                {selectedType === 'client' ? 'Join as a Client' : selectedType === 'company' ? 'Join as a Company' : 'Create Account'}
                </button>

              {/* Login Link */}
              <p className="text-gray-600 text-lg">
                Already have an account?{' '}
                <button 
                  onClick={handleLoginRedirect}
                  className="text-[#66BB6A] hover:text-[#4fb654] font-medium underline"
                >
                  Log In
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}