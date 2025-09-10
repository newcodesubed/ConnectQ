import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Save, Edit3, Plus, FileText, User } from "lucide-react";
import { useClientStore } from "../store/clients.store";
import { useAuthStore } from "../store/auth.store";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const { client, loading, error, getMyClient, updateClient } = useClientStore();
  const [requestInput, setRequestInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getMyClient();
  }, [getMyClient]);

  useEffect(() => {
    if (client && client.description) {
      setRequestInput(client.description);
    }
  }, [client]);

  const handleSaveRequest = async () => {
    if (!client) return;
    
    if (!requestInput.trim()) {
      toast.error("Please enter a request description");
      return;
    }

    setIsSaving(true);
    try {
      await updateClient(client.id, {
        description: requestInput.trim()
      });
      toast.success("Request saved successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving request:", err);
      toast.error("Failed to save request");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditRequest = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (client && client.description) {
      setRequestInput(client.description);
    } else {
      setRequestInput("");
    }
    setIsEditing(false);
  };

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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-[#2D2D2D] mb-4">Client Dashboard</h2>
        <p className="text-gray-600">
          Manage your project requests and connect with service providers.
        </p>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-[#2D2D2D] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#fa744c]" />
            Project Request
          </h3>
          {client.description && !isEditing && (
            <button
              onClick={handleEditRequest}
              className="flex items-center gap-2 text-[#fa744c] hover:text-[#e8633f] transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit Request
            </button>
          )}
        </div>

        {/* Search/Input Bar */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <textarea
              value={requestInput}
              onChange={(e) => setRequestInput(e.target.value)}
              placeholder={
                client.description 
                  ? "Edit your project request..." 
                  : "Describe your project needs, requirements, and what kind of service provider you're looking for..."
              }
              disabled={!isEditing && !!client.description}
              rows={4}
              className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl transition-all duration-200 resize-none focus:outline-none ${
                isEditing || !client.description
                  ? "border-[#fa744c] focus:border-[#e8633f] bg-white"
                  : "border-gray-200 bg-gray-50 text-gray-700"
              }`}
            />
          </div>

          {(isEditing || !client.description) && (
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveRequest}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#fa744c] hover:bg-[#e8633f] text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  "Save Request"
                )}
              </motion.button>

              {isEditing && (
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="py-3 px-6 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>

        {/* Current Request Display */}
        {client.description && !isEditing && (
          <div className="mt-8 p-6 bg-gray-50 rounded-xl border-l-4 border-[#fa744c]">
            <h4 className="text-lg font-semibold text-[#2D2D2D] mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#fa744c]" />
              Your Current Request
            </h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {client.description}
            </p>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span>Status: <span className="font-medium text-[#fa744c] capitalize">{client.status}</span></span>
              <span>•</span>
              <span>Last updated: {new Date(client.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}

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
      </motion.div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-[#fa744c] to-[#e8633f] rounded-2xl shadow-xl p-6 text-white"
      >
        <h3 className="text-xl font-bold mb-2">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-xs">1</div>
            <div>
              <p className="font-medium">Describe Your Needs</p>
              <p className="opacity-90">Add detailed project requirements</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-xs">2</div>
            <div>
              <p className="font-medium">AI Matching</p>
              <p className="opacity-90">Our system finds suitable providers</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-xs">3</div>
            <div>
              <p className="font-medium">Connect & Collaborate</p>
              <p className="opacity-90">Work with matched service providers</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
