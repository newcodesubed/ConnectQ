import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Save, 
  Edit3, 
  X, 
  FileText, 
  Upload, 
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";
import { useClientStore } from "../store/clients.store";
import { toast } from "react-hot-toast";

export default function JobPosting() {
  const { client, updateClient, loading } = useClientStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    bio: "",
    contactNumber: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        description: client.description || "",
        bio: client.bio || "",
        contactNumber: client.contactNumber || ""
      });
      // If no description exists, start in editing mode
      if (!client.description) {
        setIsEditing(true);
      }
    }
  }, [client]);

  const handleSave = async () => {
    if (!client) return;
    
    if (!formData.description.trim()) {
      toast.error("Please enter a project description");
      return;
    }

    setIsSaving(true);
    try {
      await updateClient(client.id, {
        description: formData.description.trim(),
        bio: formData.bio.trim() || undefined,
        contactNumber: formData.contactNumber.trim() || undefined
      });
      toast.success("Project posted successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving project:", err);
      toast.error("Failed to save project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (client) {
      setFormData({
        description: client.description || "",
        bio: client.bio || "",
        contactNumber: client.contactNumber || ""
      });
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (!client) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Client Profile</h3>
        <p className="text-gray-500">Please create your client profile first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#fa744c]" />
            <div>
              <h1 className="text-3xl font-bold text-[#2D2D2D]">
                {client.description ? "My Project" : "Post Your Project"}
              </h1>
              <p className="text-gray-600">
                {client.description 
                  ? "Manage your project details and requirements"
                  : "Tell us about your project and what you need"
                }
              </p>
            </div>
          </div>
          
          {client.description && !isEditing && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-[#fa744c] hover:bg-[#e8633f] text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit Project
            </button>
          )}
        </div>
      </motion.div>

      {/* Project Form/Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        {isEditing ? (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[#2D2D2D] mb-4">
              {client.description ? "Edit Project Details" : "Create Your Project"}
            </h3>
            
            {/* Project Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your project in detail. What are you looking for? What are your requirements? Include any specific technologies, timelines, or budget considerations..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fa744c] focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                Be as detailed as possible. This helps companies understand your needs and provide better proposals.
              </p>
            </div>

            {/* Bio/About Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About You/Your Company (Optional)
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell potential service providers about yourself or your company. This helps build trust and context..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fa744c] focus:border-transparent resize-none"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number (Optional)
              </label>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fa744c] focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={isSaving || !formData.description.trim()}
                className="flex items-center gap-2 bg-[#fa744c] hover:bg-[#e8633f] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {client.description ? "Update Project" : "Post Project"}
                  </>
                )}
              </button>
              
              {client.description && (
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Display Mode */
          <div className="space-y-6">
            {client.description ? (
              <>
                <div>
                  <h3 className="text-xl font-semibold text-[#2D2D2D] mb-4">Project Description</h3>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {client.description}
                    </p>
                  </div>
                </div>

                {client.bio && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">About</h4>
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {client.bio}
                      </p>
                    </div>
                  </div>
                )}

                {client.contactNumber && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h4>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <p className="text-gray-700">
                        <span className="font-medium">Phone:</span> {client.contactNumber}
                      </p>
                    </div>
                  </div>
                )}

                {/* Project Status */}
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-green-800">Project is Live</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Your project is visible to service providers and they can express interest or contact you directly.
                  </p>
                </div>
              </>
            ) : (
              /* No Project Yet */
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Project Posted Yet</h3>
                <p className="text-gray-500 mb-6">
                  Create your first project to start receiving proposals from service providers.
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-[#fa744c] hover:bg-[#e8633f] text-white px-6 py-3 rounded-lg font-medium transition-colors mx-auto"
                >
                  <FileText className="w-4 h-4" />
                  Create Project
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Tips Section */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 rounded-2xl p-6"
        >
          <h4 className="font-semibold text-blue-900 mb-3">💡 Tips for a Great Project Description</h4>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• Be specific about your requirements and expectations</li>
            <li>• Include your budget range if you're comfortable sharing</li>
            <li>• Mention any preferred technologies or platforms</li>
            <li>• Specify your timeline and any important deadlines</li>
            <li>• Describe your target audience or end users</li>
            <li>• Include any existing assets or materials you have</li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}