import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building, 
  Mail, 
  MapPin, 
  Phone, 
  Briefcase, 
  FileText, 
  Edit, 
  Calendar, 
  X,
  Upload,
  Globe,
  Quote,
  Users,
  DollarSign,
  Clock,
  Linkedin,
  Twitter,
  ExternalLink
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCompanyStore, type UpdateCompanyData } from "../store/companies.store";
import Input from "../components/Input";
import LoadingSpinner from "../components/LoadingSpinner";

function CompanyDashboard() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
  const navigate = useNavigate();

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
      setIsEditModalOpen(false);
    } catch {
      toast.error(error || "Failed to update company");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && !company) {
    return <LoadingSpinner />;
  }

  if (error && !company) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12">
          <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">No Company Found</h2>
          <p className="text-gray-600 mb-8">You haven't created a company yet.</p>
          <button
            onClick={() => navigate("/company/create")}
            className="bg-[#fa744c] hover:bg-[#e8633f] text-white px-8 py-3 rounded-lg transition duration-200 font-medium"
          >
            Create Company
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-[#2D2D2D]">Company Dashboard</h1>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-[#fa744c] hover:text-[#e8633f] transition duration-200 font-medium"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-[#fa744c] hover:bg-[#e8633f] text-white px-6 py-2 rounded-lg transition duration-200 flex items-center gap-2 font-medium"
              >
                <Edit className="w-4 h-4" />
                Edit Company
              </button>
            </div>
          </div>
        </div>

        {/* Company Card */}
        {company && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                  {company.logoUrl && (
                    <img
                      src={company.logoUrl}
                      alt={`${company.name} logo`}
                      className="h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h2 className="text-3xl font-bold text-[#2D2D2D] mb-2">{company.name}</h2>
                    {company.tagline && (
                      <p className="text-[#fa744c] italic text-lg">"{company.tagline}"</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Created: {formatDate(company.createdAt)}
                </div>
              </div>

              {/* Industry and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {company.industry && (
                  <div className="flex items-center text-[#fa744c]">
                    <Briefcase className="w-5 h-5 mr-2" />
                    <span>{company.industry}</span>
                  </div>
                )}
                {company.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2 text-[#fa744c]" />
                    <span>{company.location}</span>
                  </div>
                )}
                {company.employeeCount && (
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-2 text-[#fa744c]" />
                    <span>{company.employeeCount} employees</span>
                  </div>
                )}
                {company.foundedAt && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2 text-[#fa744c]" />
                    <span>Founded {new Date(company.foundedAt).getFullYear()}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {company.description && (
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed">{company.description}</p>
                </div>
              )}

              {/* Links */}
              <div className="flex gap-4">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-[#fa744c] hover:text-[#e8633f] transition duration-200"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Website
                  </a>
                )}
                {company.linkedinUrl && (
                  <a
                    href={company.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 transition duration-200"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </a>
                )}
                {company.twitterUrl && (
                  <a
                    href={company.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sky-500 hover:text-sky-700 transition duration-200"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </a>
                )}
              </div>
            </div>

            {/* Services & Offerings */}
            {(company.services?.length || company.technologiesUsed?.length || company.specializations?.length || company.costRange || company.deliveryDuration) && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-[#2D2D2D] mb-6">Services & Offerings</h3>
                
                {company.services?.length && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-[#fa744c] mb-3">Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {company.services.map((service, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {company.technologiesUsed?.length && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-blue-600 mb-3">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {company.technologiesUsed.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {company.specializations?.length && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-purple-600 mb-3">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {company.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(company.costRange || company.deliveryDuration) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.costRange && (
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-5 h-5 mr-3 text-[#fa744c]" />
                        <div>
                          <p className="text-sm text-gray-500">Cost Range</p>
                          <p>{company.costRange}</p>
                        </div>
                      </div>
                    )}
                    {company.deliveryDuration && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-5 h-5 mr-3 text-[#fa744c]" />
                        <div>
                          <p className="text-sm text-gray-500">Delivery Duration</p>
                          <p>{company.deliveryDuration}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-[#2D2D2D] mb-6">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-3 text-[#fa744c]" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{company.email}</p>
                  </div>
                </div>

                {company.contactNumber && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-5 h-5 mr-3 text-[#fa744c]" />
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p>{company.contactNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Edit Modal */}
        <AnimatePresence>
          {isEditModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#f2f2f2] bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setIsEditModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-6xl w-full max-h-[90vh] bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8 overflow-y-auto max-h-[90vh]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">Update Company</h3>
                    <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="text-gray-400 hover:text-white transition duration-200"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleEditSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Basic Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          icon={Building}
                          type="text"
                          name="name"
                          placeholder="Company Name *"
                          value={editFormData.name}
                          onChange={handleEditInputChange}
                          required
                        />
                        <Input
                          icon={Mail}
                          type="email"
                          name="email"
                          placeholder="Company Email *"
                          value={editFormData.email}
                          onChange={handleEditInputChange}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          icon={Briefcase}
                          type="text"
                          name="industry"
                          placeholder="Industry"
                          value={editFormData.industry}
                          onChange={handleEditInputChange}
                        />
                        <Input
                          icon={Phone}
                          type="text"
                          name="contactNumber"
                          placeholder="Contact Number"
                          value={editFormData.contactNumber}
                          onChange={handleEditInputChange}
                        />
                      </div>
                      <Input
                        icon={MapPin}
                        type="text"
                        name="location"
                        placeholder="Location"
                        value={editFormData.location}
                        onChange={handleEditInputChange}
                      />
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <textarea
                          name="description"
                          placeholder="Company Description"
                          value={editFormData.description}
                          onChange={handleEditInputChange}
                          rows={4}
                          className="w-full pl-10 pr-4 py-3 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400 transition duration-200 resize-none"
                        />
                      </div>
                    </div>

                    {/* Branding */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Branding</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <Upload className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <input
                            type="file"
                            name="logo"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full pl-10 pr-4 py-3 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                          />
                        </div>
                        <Input
                          icon={Globe}
                          type="url"
                          name="website"
                          placeholder="Website URL"
                          value={editFormData.website}
                          onChange={handleEditInputChange}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          icon={Quote}
                          type="text"
                          name="tagline"
                          placeholder="Company Tagline"
                          value={editFormData.tagline}
                          onChange={handleEditInputChange}
                        />
                        <Input
                          icon={Calendar}
                          type="date"
                          name="foundedAt"
                          placeholder="Founded Date"
                          value={editFormData.foundedAt}
                          onChange={handleEditInputChange}
                        />
                      </div>
                    </div>

                    {/* Services & Offerings */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Services & Offerings</h4>
                      
                      {/* Services */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Services</label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={servicesInput}
                              onChange={(e) => setServicesInput(e.target.value)}
                              placeholder="Add a service"
                              className="flex-1 px-3 py-2 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400"
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('services', servicesInput, setServicesInput))}
                            />
                            <button
                              type="button"
                              onClick={() => addToArray('services', servicesInput, setServicesInput)}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">Technologies Used</label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={technologiesInput}
                              onChange={(e) => setTechnologiesInput(e.target.value)}
                              placeholder="Add a technology"
                              className="flex-1 px-3 py-2 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400"
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('technologiesUsed', technologiesInput, setTechnologiesInput))}
                            />
                            <button
                              type="button"
                              onClick={() => addToArray('technologiesUsed', technologiesInput, setTechnologiesInput)}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
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
                        <Input
                          icon={DollarSign}
                          type="text"
                          name="costRange"
                          placeholder="Cost Range (e.g., $5k-$50k)"
                          value={editFormData.costRange}
                          onChange={handleEditInputChange}
                        />
                        <Input
                          icon={Clock}
                          type="text"
                          name="deliveryDuration"
                          placeholder="Delivery Duration (e.g., 2-6 weeks)"
                          value={editFormData.deliveryDuration}
                          onChange={handleEditInputChange}
                        />
                      </div>

                      {/* Specializations */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Specializations</label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={specializationsInput}
                              onChange={(e) => setSpecializationsInput(e.target.value)}
                              placeholder="Add a specialization"
                              className="flex-1 px-3 py-2 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400"
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('specializations', specializationsInput, setSpecializationsInput))}
                            />
                            <button
                              type="button"
                              onClick={() => addToArray('specializations', specializationsInput, setSpecializationsInput)}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
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
                      <h4 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Company Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          icon={Users}
                          type="number"
                          name="employeeCount"
                          placeholder="Employee Count"
                          value={editFormData.employeeCount}
                          onChange={handleEditInputChange}
                        />
                        <Input
                          icon={Linkedin}
                          type="url"
                          name="linkedinUrl"
                          placeholder="LinkedIn URL"
                          value={editFormData.linkedinUrl}
                          onChange={handleEditInputChange}
                        />
                        <Input
                          icon={Twitter}
                          type="url"
                          name="twitterUrl"
                          placeholder="Twitter URL"
                          value={editFormData.twitterUrl}
                          onChange={handleEditInputChange}
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="text-red-500 font-semibold text-sm">{error}</p>
                    )}

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="flex-1 py-3 px-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Updating...
                          </div>
                        ) : (
                          "Update Company"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CompanyDashboard;
