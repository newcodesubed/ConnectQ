import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { 
  Building, 
  Mail, 
  MapPin, 
  Phone, 
  Briefcase, 
  FileText, 
  Upload,
  Globe,
  Quote,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Linkedin,
  Twitter
} from "lucide-react";
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
    contactNumber: "",
    // Branding
    logo: null as File | null,
    website: "",
    tagline: "",
    foundedAt: "",
    // Offerings
    services: [] as string[],
    technologiesUsed: [] as string[],
    costRange: "",
    deliveryDuration: "",
    specializations: [] as string[],
    // Scale
    employeeCount: "",
    // Reputation
    reviews: [] as string[],
    // Social Links
    linkedinUrl: "",
    twitterUrl: ""
  });

  const [servicesInput, setServicesInput] = useState("");
  const [technologiesInput, setTechnologiesInput] = useState("");
  const [specializationsInput, setSpecializationsInput] = useState("");

  const { createCompany, loading, error } = useCompanyStore();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      logo: file
    }));
  };

  const addToArray = (arrayName: 'services' | 'technologiesUsed' | 'specializations' | 'reviews', input: string, setInput: (value: string) => void) => {
    if (input.trim()) {
      setFormData(prev => ({
        ...prev,
        [arrayName]: [...prev[arrayName], input.trim()]
      }));
      setInput("");
    }
  };

  const removeFromArray = (arrayName: 'services' | 'technologiesUsed' | 'specializations' | 'reviews', index: number) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        logo: formData.logo || undefined, // Convert null to undefined
        employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : undefined
      };
      await createCompany(submitData);
      toast.success("Company created successfully!");
      navigate("/company/dashboard");
    } catch {
      toast.error(error || "Failed to create company");
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Building className="w-12 h-12 text-[#fa744c]" />
              <div>
                <h2 className="text-3xl font-bold text-[#2D2D2D]">Create Your Company</h2>
                <p className="text-gray-600 mt-1">Set up your company profile to get started</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-[#fa744c] hover:text-[#e8633f] transition duration-200 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[#2D2D2D] border-b border-gray-200 pb-2">Basic Information</h3>
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
                  placeholder="Industry"
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
                placeholder="Location"
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
                  className="w-full pl-10 pr-4 py-3 bg-white rounded-lg border border-gray-300 focus:border-[#fa744c] focus:ring-2 focus:ring-[#fa744c] focus:ring-opacity-20 text-[#2D2D2D] placeholder-gray-400 transition duration-200 resize-none"
                />
              </div>
            </div>

            {/* Branding */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[#2D2D2D] border-b border-gray-200 pb-2">Branding</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Upload className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-lg border border-gray-300 focus:border-[#fa744c] focus:ring-2 focus:ring-[#fa744c] focus:ring-opacity-20 text-[#2D2D2D] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#fa744c] file:text-white hover:file:bg-[#e8633f] transition duration-200"
                  />
                </div>
                <Input
                  icon={Globe}
                  type="url"
                  name="website"
                  placeholder="Website URL"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  icon={Quote}
                  type="text"
                  name="tagline"
                  placeholder="Company Tagline"
                  value={formData.tagline}
                  onChange={handleInputChange}
                />
                <Input
                  icon={Calendar}
                  type="date"
                  name="foundedAt"
                  placeholder="Founded Date"
                  value={formData.foundedAt}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Offerings */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[#2D2D2D] border-b border-gray-200 pb-2">Services & Offerings</h3>
              
              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={servicesInput}
                      onChange={(e) => setServicesInput(e.target.value)}
                      placeholder="Add a service"
                      className="flex-1 px-3 py-2 bg-white rounded-lg border border-gray-300 focus:border-[#fa744c] focus:ring-2 focus:ring-[#fa744c] focus:ring-opacity-20 text-[#2D2D2D] placeholder-gray-400"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('services', servicesInput, setServicesInput))}
                    />
                    <button
                      type="button"
                      onClick={() => addToArray('services', servicesInput, setServicesInput)}
                      className="px-4 py-2 bg-[#fa744c] text-white rounded-lg hover:bg-[#e8633f] transition duration-200"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.services.map((service, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                      >
                        {service}
                        <button
                          type="button"
                          onClick={() => removeFromArray('services', index)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Technologies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Technologies Used</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={technologiesInput}
                      onChange={(e) => setTechnologiesInput(e.target.value)}
                      placeholder="Add a technology"
                      className="flex-1 px-3 py-2 bg-white rounded-lg border border-gray-300 focus:border-[#fa744c] focus:ring-2 focus:ring-[#fa744c] focus:ring-opacity-20 text-[#2D2D2D] placeholder-gray-400"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('technologiesUsed', technologiesInput, setTechnologiesInput))}
                    />
                    <button
                      type="button"
                      onClick={() => addToArray('technologiesUsed', technologiesInput, setTechnologiesInput)}
                      className="px-4 py-2 bg-[#fa744c] text-white rounded-lg hover:bg-[#e8633f] transition duration-200"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.technologiesUsed.map((tech, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeFromArray('technologiesUsed', index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  icon={DollarSign}
                  type="text"
                  name="costRange"
                  placeholder="Cost Range (e.g., $5k-$50k)"
                  value={formData.costRange}
                  onChange={handleInputChange}
                />
                <Input
                  icon={Clock}
                  type="text"
                  name="deliveryDuration"
                  placeholder="Delivery Duration (e.g., 2-6 weeks)"
                  value={formData.deliveryDuration}
                  onChange={handleInputChange}
                />
              </div>

              {/* Specializations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={specializationsInput}
                      onChange={(e) => setSpecializationsInput(e.target.value)}
                      placeholder="Add a specialization"
                      className="flex-1 px-3 py-2 bg-white rounded-lg border border-gray-300 focus:border-[#fa744c] focus:ring-2 focus:ring-[#fa744c] focus:ring-opacity-20 text-[#2D2D2D] placeholder-gray-400"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('specializations', specializationsInput, setSpecializationsInput))}
                    />
                    <button
                      type="button"
                      onClick={() => addToArray('specializations', specializationsInput, setSpecializationsInput)}
                      className="px-4 py-2 bg-[#fa744c] text-white rounded-lg hover:bg-[#e8633f] transition duration-200"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                      >
                        {spec}
                        <button
                          type="button"
                          onClick={() => removeFromArray('specializations', index)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Company Scale & Social */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[#2D2D2D] border-b border-gray-200 pb-2">Company Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  icon={Users}
                  type="number"
                  name="employeeCount"
                  placeholder="Employee Count"
                  value={formData.employeeCount}
                  onChange={handleInputChange}
                />
                <Input
                  icon={Linkedin}
                  type="url"
                  name="linkedinUrl"
                  placeholder="LinkedIn URL"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                />
                <Input
                  icon={Twitter}
                  type="url"
                  name="twitterUrl"
                  placeholder="Twitter URL"
                  value={formData.twitterUrl}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 font-semibold text-sm">{error}</p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-6 bg-[#fa744c] text-white font-bold rounded-xl shadow-lg hover:bg-[#e8633f] focus:outline-none focus:ring-2 focus:ring-[#fa744c] focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </motion.div>
      </div>
    </div>
  );
}

export default CreateCompany;
