import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Building, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  Upload,
  Globe,
  Quote,
  Users,
  DollarSign,
  Clock,
  Linkedin,
  Twitter,
  Calendar,
  MapPin,
  Save
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useCompanyStore, type UpdateCompanyData } from "../store/companies.store";
import LoadingSpinner from "../components/LoadingSpinner";
import DateInput from "../components/DateInput";

interface CompanyUpdatePageProps {
  onUpdateSuccess?: () => void;
}

export default function CompanyUpdatePage({ onUpdateSuccess }: CompanyUpdatePageProps) {
  const [editFormData, setEditFormData] = useState({
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
    // Social Links
    linkedinUrl: "",
    twitterUrl: ""
  });

  const [servicesInput, setServicesInput] = useState("");
  const [technologiesInput, setTechnologiesInput] = useState("");
  const [specializationsInput, setSpecializationsInput] = useState("");

  const { company, loading, error, getMyCompany, updateCompany } = useCompanyStore();

  useEffect(() => {
    getMyCompany();
  }, [getMyCompany]);

  useEffect(() => {
    if (company) {
      setEditFormData({
        name: company.name || "",
        email: company.email || "",
        description: company.description || "",
        industry: company.industry || "",
        location: company.location || "",
        contactNumber: company.contactNumber || "",
        // Branding
        logo: null,
        website: company.website || "",
        tagline: company.tagline || "",
        foundedAt: company.foundedAt ? company.foundedAt.split('T')[0] : "",
        // Offerings
        services: company.services || [],
        technologiesUsed: company.technologiesUsed || [],
        costRange: company.costRange || "",
        deliveryDuration: company.deliveryDuration || "",
        specializations: company.specializations || [],
        // Scale
        employeeCount: company.employeeCount?.toString() || "",
        // Social Links
        linkedinUrl: company.linkedinUrl || "",
        twitterUrl: company.twitterUrl || ""
      });
    }
  }, [company]);

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setEditFormData(prev => ({
      ...prev,
      logo: file
    }));
  };

  const addToArray = (arrayName: 'services' | 'technologiesUsed' | 'specializations', input: string, setInput: (value: string) => void) => {
    if (input.trim()) {
      setEditFormData(prev => ({
        ...prev,
        [arrayName]: [...prev[arrayName], input.trim()]
      }));
      setInput("");
    }
  };

  const removeFromArray = (arrayName: 'services' | 'technologiesUsed' | 'specializations', index: number) => {
    setEditFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    try {
      // Create update data with only changed fields
      const updateData: UpdateCompanyData = {};
      
      // Basic fields
      if (editFormData.name !== company.name) updateData.name = editFormData.name;
      if (editFormData.email !== company.email) updateData.email = editFormData.email;
      if (editFormData.description !== company.description) updateData.description = editFormData.description;
      if (editFormData.industry !== company.industry) updateData.industry = editFormData.industry;
      if (editFormData.location !== company.location) updateData.location = editFormData.location;
      if (editFormData.contactNumber !== company.contactNumber) updateData.contactNumber = editFormData.contactNumber;
      
      // Branding
      if (editFormData.logo) updateData.logo = editFormData.logo;
      if (editFormData.website !== company.website) updateData.website = editFormData.website;
      if (editFormData.tagline !== company.tagline) updateData.tagline = editFormData.tagline;
      if (editFormData.foundedAt !== (company.foundedAt ? company.foundedAt.split('T')[0] : "")) {
        updateData.foundedAt = editFormData.foundedAt;
      }
      
      // Offerings
      if (JSON.stringify(editFormData.services) !== JSON.stringify(company.services || [])) {
        updateData.services = editFormData.services;
      }
      if (JSON.stringify(editFormData.technologiesUsed) !== JSON.stringify(company.technologiesUsed || [])) {
        updateData.technologiesUsed = editFormData.technologiesUsed;
      }
      if (editFormData.costRange !== company.costRange) updateData.costRange = editFormData.costRange;
      if (editFormData.deliveryDuration !== company.deliveryDuration) updateData.deliveryDuration = editFormData.deliveryDuration;
      if (JSON.stringify(editFormData.specializations) !== JSON.stringify(company.specializations || [])) {
        updateData.specializations = editFormData.specializations;
      }
      
      // Scale
      const newEmployeeCount = editFormData.employeeCount ? parseInt(editFormData.employeeCount) : undefined;
      if (newEmployeeCount !== company.employeeCount) updateData.employeeCount = newEmployeeCount;
      
      // Social Links
      if (editFormData.linkedinUrl !== company.linkedinUrl) updateData.linkedinUrl = editFormData.linkedinUrl;
      if (editFormData.twitterUrl !== company.twitterUrl) updateData.twitterUrl = editFormData.twitterUrl;

      await updateCompany(company.id, updateData);
      toast.success("Company updated successfully!");
      
      // Call the callback to redirect to dashboard tab
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (err) {
      console.error("Error updating company:", err);
      toast.error(error || "Failed to update company");
    }
  };

  if (loading && !company) {
    return <LoadingSpinner />;
  }

  if (!company) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <h3 className="text-xl font-semibold text-[#2D2D2D] mb-2">No Company Found</h3>
        <p className="text-gray-600 mb-6">
          You haven't created a company yet. Please use the "Get Started" tab to create your company first.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-[#2D2D2D] mb-4">Update Company Profile</h2>
        <p className="text-gray-600">
          Manage your company information and keep your profile up to date.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <form onSubmit={handleEditSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#2D2D2D] border-b border-gray-200 pb-2">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    placeholder="Company Name"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    placeholder="Company Email"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="industry"
                    value={editFormData.industry}
                    onChange={handleEditInputChange}
                    placeholder="Industry"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="contactNumber"
                    value={editFormData.contactNumber}
                    onChange={handleEditInputChange}
                    placeholder="Contact Number"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditInputChange}
                  placeholder="Location"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  placeholder="Company Description"
                  rows={4}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#2D2D2D] border-b border-gray-200 pb-2">Branding</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                <div className="relative">
                  <Upload className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#fa744c] file:text-white hover:file:bg-[#e8633f]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    name="website"
                    value={editFormData.website}
                    onChange={handleEditInputChange}
                    placeholder="Website URL"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Tagline</label>
                <div className="relative">
                  <Quote className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="tagline"
                    value={editFormData.tagline}
                    onChange={handleEditInputChange}
                    placeholder="Company Tagline"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Founded Date</label>
                <DateInput
                  icon={Calendar}
                  name="foundedAt"
                  value={editFormData.foundedAt}
                  onChange={handleEditInputChange}
                  placeholder="Founded Date"
                />
              </div>
            </div>
          </div>

          {/* Services & Offerings */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#2D2D2D] border-b border-gray-200 pb-2">Services & Offerings</h4>
            
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('services', servicesInput, setServicesInput))}
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('services', servicesInput, setServicesInput)}
                    className="px-4 py-2 bg-[#fa744c] text-white rounded-lg hover:bg-[#e8633f] transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editFormData.services.map((service, index) => (
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('technologiesUsed', technologiesInput, setTechnologiesInput))}
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('technologiesUsed', technologiesInput, setTechnologiesInput)}
                    className="px-4 py-2 bg-[#fa744c] text-white rounded-lg hover:bg-[#e8633f] transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editFormData.technologiesUsed.map((tech, index) => (
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost Range</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="costRange"
                    value={editFormData.costRange}
                    onChange={handleEditInputChange}
                    placeholder="Cost Range (e.g., $5k-$50k)"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Duration</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="deliveryDuration"
                    value={editFormData.deliveryDuration}
                    onChange={handleEditInputChange}
                    placeholder="Delivery Duration (e.g., 2-6 weeks)"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors"
                  />
                </div>
              </div>
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('specializations', specializationsInput, setSpecializationsInput))}
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('specializations', specializationsInput, setSpecializationsInput)}
                    className="px-4 py-2 bg-[#fa744c] text-white rounded-lg hover:bg-[#e8633f] transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editFormData.specializations.map((spec, index) => (
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

          {/* Company Details */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#2D2D2D] border-b border-gray-200 pb-2">Company Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee Count</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="employeeCount"
                    value={editFormData.employeeCount}
                    onChange={handleEditInputChange}
                    placeholder="Employee Count"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={editFormData.linkedinUrl}
                    onChange={handleEditInputChange}
                    placeholder="LinkedIn URL"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    name="twitterUrl"
                    value={editFormData.twitterUrl}
                    onChange={handleEditInputChange}
                    placeholder="Twitter URL"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa744c] focus:border-[#fa744c] outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
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
            className="w-full bg-[#fa744c] hover:bg-[#e8633f] text-white font-semibold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </div>
            ) : (
              "Update Company Profile"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
