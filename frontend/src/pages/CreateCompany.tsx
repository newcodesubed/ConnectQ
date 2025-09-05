import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Building, Mail, MapPin, Phone, Briefcase, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Input from "../components/Input";
import { useCompanyStore } from "../store/companies.store";

function CreateCompany() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    industry: "",
    location: "",
    contactNumber: ""
  });

  const { createCompany, loading, error } = useCompanyStore();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createCompany(formData);
      toast.success("Company created successfully!");
      navigate("/company/dashboard");
    } catch {
      toast.error(error || "Failed to create company");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <Building className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
              Create Your Company
            </h2>
            <p className="text-gray-400 mt-2">Set up your company profile to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                icon={Building}
                type="text"
                name="name"
                placeholder="Company Name *"
                value={formData.name}
                onChange={handleInputChange}
                required
              />

              <Input
                icon={Mail}
                type="email"
                name="email"
                placeholder="Company Email *"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                icon={Briefcase}
                type="text"
                name="industry"
                placeholder="Industry (e.g., Technology)"
                value={formData.industry}
                onChange={handleInputChange}
              />

              <Input
                icon={Phone}
                type="text"
                name="contactNumber"
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={handleInputChange}
              />
            </div>

            <Input
              icon={MapPin}
              type="text"
              name="location"
              placeholder="Location (e.g., New York, USA)"
              value={formData.location}
              onChange={handleInputChange}
            />

            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                name="description"
                placeholder="Company Description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400 transition duration-200 resize-none"
              />
            </div>

            {error && (
              <p className="text-red-500 font-semibold text-sm">{error}</p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Company...
                </div>
              ) : (
                "Create Company"
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-green-400 hover:text-green-300 transition duration-200"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CreateCompany;
