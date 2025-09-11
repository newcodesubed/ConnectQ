import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, User, Phone, FileText, CheckCircle } from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import { useClientStore } from "../store/clients.store";
import toast from "react-hot-toast";


export default function ClientGetStartedPage() {
  const { user } = useAuthStore();
  const { createClient, client, loading, error, getMyClient } = useClientStore();
  const [formData, setFormData] = useState({
    profilePic: null as File | null,
    contactNumber: "",
    bio: ""
  });
  
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showCard, setShowCard] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if client already exists
  useEffect(() => {
    getMyClient();
  }, [getMyClient]);

  // Show card if client exists
  useEffect(() => {
    if (client) {
      setShowCard(true);
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
    
    if (!formData.contactNumber || !formData.bio) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createClient({
        profilePic: formData.profilePic || undefined,
        contactNumber: formData.contactNumber,
        bio: formData.bio,
        status: 'open'
      });
      
      toast.success("Client profile created successfully!");
      setShowCard(true);
    } catch (err) {
      console.error("Error creating client profile:", err);
      toast.error("Failed to create client profile");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (showCard && client) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-[#2D2D2D] mb-2">Profile Created Successfully!</h2>
          <p className="text-gray-600">Your client profile is now live and ready to connect with service providers.</p>
        </motion.div>

        {/* Client Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              {client.profilePicUrl ? (
                <img
                  src={client.profilePicUrl}
                  alt={user?.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#fa744c]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#fa744c] bg-opacity-10 flex items-center justify-center border-4 border-[#fa744c]">
                  <User className="w-12 h-12 text-[#fa744c]" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-[#2D2D2D] mb-1">{user?.name}</h3>
              <p className="text-gray-600 mb-2">{user?.email}</p>
              <div className="flex items-center gap-2 text-[#fa744c]">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm font-medium">Active Client</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#fa744c]" />
              <span className="text-gray-700">{client.contactNumber}</span>
            </div>
            
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-[#fa744c] mt-1" />
              <div>
                <p className="text-gray-700">{client.bio}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Status: <span className="text-green-600 font-medium capitalize">{client.status}</span></span>
              <span>Joined: {new Date(client.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </motion.div>

        
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-[#2D2D2D] mb-4">Create Your Client Profile</h2>
        <p className="text-gray-600">
          Set up your profile to start connecting with service providers and showcase your requirements.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
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
              Click to upload your profile picture (Max 5MB)
            </p>
          </div>

          {/* User Info Display */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <span className="text-gray-900">{user?.name}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <span className="text-gray-900">{user?.email}</span>
              </div>
            </div>
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
              placeholder="Tell us about yourself, your business needs, or what kind of services you're looking for..."
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

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#fa744c] hover:bg-[#e8633f] text-white font-semibold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Profile...
              </div>
            ) : (
              "Create Client Profile"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
