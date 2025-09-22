import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {  Plus, User, FileText, Search, Bell, Building2 } from "lucide-react";
import { useClientStore } from "../store/clients.store";
import { useAuthStore } from "../store/auth.store";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { TextCarousel, type TextSlide } from "../components/TextCarousel";
import SearchInput from "../components/SearchInput";
import SearchResults from "../components/SearchResults";
import JobPosting from "../components/JobPosting";
import InterestNotifications from "../components/InterestNotifications";

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const { 
    client, 
    loading, 
    error, 
    getMyClient, 
    searchResults,
    searchLoading,
    searchCompanies,
    clearSearchResults
  } = useClientStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'project' | 'notifications'>('dashboard');
  const [searchQuery, setSearchQuery] = useState("");

  // Define carousel slides
  const carouselSlides: TextSlide[] = [
    {
      id: "step-1",
      title: "How It Works",
      content: "1. Describe Your Needs - Add detailed project requirements and let us know what you're looking for in a service provider."
    },
    {
      id: "step-2", 
      title: "AI-Powered Matching",
      content: "2. AI Matching - Our intelligent system analyzes your requirements and finds the most suitable service providers for your project."
    },
    {
      id: "step-3",
      title: "Connect & Collaborate", 
      content: "3. Connect & Collaborate - Work directly with matched service providers and bring your projects to life with expert help."
    },
    {
      id: "step-4",
      title: "Quality Assurance",
      content: "4. Quality & Support - Get ongoing support throughout your project journey with quality assurance and dedicated assistance."
    }
  ];

  useEffect(() => {
    getMyClient();
  }, [getMyClient]);

  // const handleSaveRequest = async () => {
  //   if (!client) return;
    
  //   if (!requestInput.trim()) {
  //     toast.error("Please enter a request description");
  //     return;
  //   }

  //   setIsSaving(true);
  //   try {
  //     await updateClient(client.id, {
  //       description: requestInput.trim()
  //     });
  //     toast.success("Request saved successfully!");
  //     setIsEditing(false);
  //   } catch (err) {
  //     console.error("Error saving request:", err);
  //     toast.error("Failed to save request");
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      await searchCompanies(query);
      toast.success(`Found ${searchResults.length} companies matching your requirements!`);
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Failed to search companies. Please try again.");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    clearSearchResults();
  };

  // const handleEditRequest = () => {
  //   setIsEditing(true);
  // };

  // const handleCancelEdit = () => {
  //   if (client && client.description) {
  //     setRequestInput(client.description);
  //   } else {
  //     setRequestInput("");
  //   }
  //   setIsEditing(false);
  // };

  if (loading && !client) {
    return <LoadingSpinner />;
  }

  if (!client) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <h3 className="text-xl font-semibold text-[#2D2D2D] mb-2">No Client Profile Found</h3>
        <p className="text-gray-600 mb-6">
          You need to create your client profile first before accessing the dashboard.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#fa744c] hover:bg-[#e8633f] text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          Go to Get Started
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6 mb-8"
      >
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-[#fa744c] text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Search className="w-4 h-4" />
            Find Companies
          </button>
          <button
            onClick={() => setActiveTab('project')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'project'
                ? 'bg-[#fa744c] text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            My Project
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'bg-[#fa744c] text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            Notifications
          </button>
        </div>
      </motion.div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* How It Works Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <TextCarousel 
              slides={carouselSlides}
              autoPlay={true}
              autoPlayInterval={5000}
              showDots={true}
              showArrows={true}
              className="w-full"
            />
          </motion.div>

          {/* Client Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              {client?.profilePicUrl ? (
                <img
                  src={client.profilePicUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-4 border-[#fa744c]"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#fa744c] bg-opacity-10 flex items-center justify-center">
                  <User className="w-8 h-8 text-[#fa744c]" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-[#2D2D2D]">{user?.name}</h3>
                <p className="text-gray-600">{user?.email}</p>
                {client?.bio && (
                  <p className="text-sm text-gray-500 mt-1">{client.bio}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Company Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <SearchInput
              onSearch={handleSearch}
              loading={searchLoading}
              placeholder="Search for companies based on your project needs..."
              hasResults={searchResults.length > 0}
              onClear={handleClearSearch}
            />

            {searchResults.length > 0 && (
              <SearchResults
                results={searchResults}
                loading={searchLoading}
                query={searchQuery}
                onClearResults={handleClearSearch}
              />
            )}
          </motion.div>

          {/* Encourage Project Creation */}
          {!client?.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-blue-50 rounded-2xl p-6 border border-blue-200"
            >
              <div className="flex items-start gap-3">
                <FileText className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Ready to Get Started?</h4>
                  <p className="text-blue-700 mb-4">
                    Create your project description to help companies understand your needs and receive targeted proposals.
                  </p>
                  <button
                    onClick={() => setActiveTab('project')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {activeTab === 'project' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <JobPosting />
        </motion.div>
      )}

      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <InterestNotifications />
        </motion.div>
      )}
    </div>
  );
}
