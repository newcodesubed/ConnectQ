import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building, Mail, MapPin, Phone, Briefcase, FileText, Edit, Calendar, X } from "lucide-react";
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
    contactNumber: ""
  });

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
        contactNumber: company.contactNumber || ""
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    try {
      // Only send fields that have changed
      const updateData: UpdateCompanyData = {};
      if (editFormData.name !== company.name) updateData.name = editFormData.name;
      if (editFormData.email !== company.email) updateData.email = editFormData.email;
      if (editFormData.description !== company.description) updateData.description = editFormData.description;
      if (editFormData.industry !== company.industry) updateData.industry = editFormData.industry;
      if (editFormData.location !== company.location) updateData.location = editFormData.location;
      if (editFormData.contactNumber !== company.contactNumber) updateData.contactNumber = editFormData.contactNumber;

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No Company Found</h2>
          <p className="text-gray-400 mb-6">You haven't created a company yet.</p>
          <button
            onClick={() => navigate("/company/create")}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-200"
          >
            Create Company
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Company Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-green-400 hover:text-green-300 transition duration-200"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition duration-200 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Company
            </button>
          </div>
        </div>

        {/* Company Card */}
        {company && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl p-8"
          >
            {/* Posted Date */}
            <div className="flex items-center text-gray-400 text-sm mb-6">
              <Calendar className="w-4 h-4 mr-2" />
              Posted at: {formatDate(company.createdAt)}
            </div>

            {/* Company Name */}
            <h2 className="text-3xl font-bold text-white mb-4">{company.name}</h2>

            {/* Industry */}
            {company.industry && (
              <div className="flex items-center text-green-400 mb-4">
                <Briefcase className="w-5 h-5 mr-2" />
                <span className="text-lg">{company.industry}</span>
              </div>
            )}

            {/* Description */}
            {company.description && (
              <div className="mb-6">
                <p className="text-gray-300 leading-relaxed">{company.description}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-600">
              <div className="flex items-center text-gray-300">
                <Mail className="w-5 h-5 mr-3 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p>{company.email}</p>
                </div>
              </div>

              {company.contactNumber && (
                <div className="flex items-center text-gray-300">
                  <Phone className="w-5 h-5 mr-3 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Contact</p>
                    <p>{company.contactNumber}</p>
                  </div>
                </div>
              )}

              {company.location && (
                <div className="flex items-center text-gray-300">
                  <MapPin className="w-5 h-5 mr-3 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <p>{company.location}</p>
                  </div>
                </div>
              )}
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
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setIsEditModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-2xl w-full bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">Update Company</h3>
                    <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="text-gray-400 hover:text-white transition duration-200"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleEditSubmit} className="space-y-6">
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
