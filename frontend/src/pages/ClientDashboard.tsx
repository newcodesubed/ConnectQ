import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {  Plus, User } from "lucide-react";
import { useClientStore } from "../store/clients.store";
import { useAuthStore } from "../store/auth.store";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { TextCarousel, type TextSlide } from "../components/TextCarousel";
import SearchInput from "../components/SearchInput";
import SearchResults from "../components/SearchResults";

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
  const [requestInput, setRequestInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
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

  useEffect(() => {
    if (client && client.description) {
      setRequestInput(client.description);
    }
  }, [client]);

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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* How It Works Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center gap-4 mb-4">
          {client.profilePicUrl ? (
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
            {client.bio && (
              <p className="text-sm text-gray-500 mt-1">{client.bio}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Request Management Section */}
      
        


        {/* Help Text */}
        {!client.description && !isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200"
          >
            <div className="flex items-start gap-3">
              <Plus className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Add Your First Request</h4>
                <p className="text-blue-700 text-sm">
                  Describe your project needs in detail. This will help service providers understand your requirements and provide better matches.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      

      {/* Company Search Section */}
      {client.description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
      )}
    </div>
  );
}
