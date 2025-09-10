import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  MapPin, 
  Phone, 
  Briefcase, 
  Calendar, 
  Users,
  DollarSign,
  Clock,
  Linkedin,
  Twitter,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCompanyStore } from "../store/companies.store";
import LoadingSpinner from "../components/LoadingSpinner";

function CompanyDashboard() {
  const { company, loading, error, getMyCompany } = useCompanyStore();
  const navigate = useNavigate();

  useEffect(() => {
    getMyCompany();
  }, [getMyCompany]);

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
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
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
    </div>
  );
}

export default CompanyDashboard;
