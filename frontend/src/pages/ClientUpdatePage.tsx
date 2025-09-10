import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Camera, 
  User, 
  Phone, 
  Save, 
  Trash2, 
  AlertCircle
} from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import { useClientStore } from "../store/clients.store";
import toast from "react-hot-toast";

export default function ClientUpdatePage() {
  const { user } = useAuthStore();
  const { 
    client, 
    loading, 
    error, 
    getMyClient, 
    updateClient, 
    updateClientStatus, 
    deleteClient 
  } = useClientStore();
  
  const [formData, setFormData] = useState({
    profilePic: null as File | null,
    contactNumber: "",
    bio: "",
    status: 'open' as 'open' | 'matched' | 'closed'
  });
  
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load client data on component mount
  useEffect(() => {
    getMyClient();
  }, [getMyClient]);

  // Update form data when client data is loaded
  useEffect(() => {
    if (client) {
      setFormData({
        profilePic: null,
        contactNumber: client.contactNumber || "",
        bio: client.bio || "",
        status: client.status
      });
      setPreviewUrl(client.profilePicUrl || "");
    }
  }, [client]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, GIF, WebP)");
        return;
      }

      setFormData(prev => ({ ...prev, profilePic: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!client) {
      toast.error("No client profile found");
      return;
    }

    if (!formData.contactNumber || !formData.bio) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await updateClient(client.id, {
        profilePic: formData.profilePic || undefined,
        contactNumber: formData.contactNumber,
        bio: formData.bio,
        status: formData.status
      });
      
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating client profile:", err);
      toast.error("Failed to update profile");
    }
  };

  const handleStatusUpdate = async (newStatus: 'open' | 'matched' | 'closed') => {
    if (!client) return;

    try {
      await updateClientStatus(client.id, newStatus);
      setFormData(prev => ({ ...prev, status: newStatus }));
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!client) return;

    try {
      await deleteClient(client.id);
      toast.success("Profile deleted successfully");
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Error deleting profile:", err);
      toast.error("Failed to delete profile");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'matched': return 'text-blue-600 bg-blue-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading && !client) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 w-32 bg-gray-300 rounded-full mx-auto"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#2D2D2D] mb-2">No Profile Found</h3>
          <p className="text-gray-600 mb-6">
            You haven't created a client profile yet. Please use the "Get Started" tab to create your profile first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-[#2D2D2D] mb-4">Manage Your Profile</h2>
        <p className="text-gray-600">
          Update your information and manage your client profile settings.
        </p>
      </motion.div>

      {/* Current Profile Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <h3 className="text-lg font-semibold text-[#2D2D2D] mb-4">Current Profile</h3>
        <div className="flex items-center gap-4">
          {client.profilePicUrl ? (
            <img
              src={client.profilePicUrl}
              alt={user?.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#fa744c]"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#fa744c] bg-opacity-10 flex items-center justify-center border-2 border-[#fa744c]">
              <User className="w-8 h-8 text-[#fa744c]" />
            </div>
          )}
          
          <div className="flex-1">
            <h4 className="font-semibold text-[#2D2D2D]">{user?.name}</h4>
            <p className="text-sm text-gray-600">{user?.email}</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
              {client.status.toUpperCase()}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Status Update Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <h3 className="text-lg font-semibold text-[#2D2D2D] mb-4">Quick Status Update</h3>
        <div className="grid grid-cols-3 gap-3">
          {['open', 'matched', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusUpdate(status as 'open' | 'matched' | 'closed')}
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.status === status
                  ? 'border-[#fa744c] bg-[#fa744c] text-white'
                  : 'border-gray-200 hover:border-[#fa744c] hover:text-[#fa744c]'
              }`}
            >
              <div className="text-sm font-medium capitalize">{status}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Update Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <h3 className="text-lg font-semibold text-[#2D2D2D] mb-6">Update Information</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="text-center">
            <div className="relative inline-block">
              <div 
                className="w-32 h-32 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#fa744c] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-500">Upload Photo</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Click to update your profile picture
            </p>
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="Enter your contact number"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio / About Yourself *
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors resize-none"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#fa744c] hover:bg-[#e8633f] text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? "Updating..." : "Update Profile"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-3 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#2D2D2D] mb-2">Delete Profile</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your client profile? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
