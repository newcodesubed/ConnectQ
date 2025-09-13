import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  Building, 
  MapPin, 
  Users, 
  Mail, 
  Star, 
  Globe,
  Linkedin,
  Twitter,
  Target,
  X,
  Eye,
  DollarSign,
  Award,
  Clock
} from "lucide-react";
import type { SearchResult } from "../services/companySearch.service";

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  query: string;
  onClearResults: () => void;
}

export default function SearchResults({ results, loading, query, onClearResults }: SearchResultsProps) {
  const [selectedCompany, setSelectedCompany] = useState<SearchResult | null>(null);

  const handleViewProfile = (company: SearchResult) => {
    setSelectedCompany(company);
  };

  const handleCloseProfile = () => {
    setSelectedCompany(null);
  };
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#fa744c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for matching companies...</p>
            <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (results.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Companies Found</h3>
          <p className="text-gray-500 mb-6">
            We couldn't find any companies matching your request. Try adjusting your search terms.
          </p>
          <button
            onClick={onClearResults}
            className="text-[#fa744c] hover:text-[#e8633f] font-medium"
          >
            Try a different search
          </button>
        </div>
      </motion.div>
    );
  }

  const formatServices = (services: string) => {
    if (!services) return [];
    return services.split(', ').filter(Boolean);
  };

  const formatTechnologies = (technologies: string) => {
    if (!technologies) return [];
    return technologies.split(', ').filter(Boolean);
  };

  // Company Profile Modal Component
  const CompanyProfileModal = ({ company }: { company: SearchResult }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleCloseProfile}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#fa744c] bg-opacity-10 rounded-xl flex items-center justify-center">
                <Building className="w-8 h-8 text-[#fa744c]" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-[#2D2D2D]">{company.metadata.name}</h2>
                {company.metadata.tagline && (
                  <p className="text-[#fa744c] italic text-lg">"{company.metadata.tagline}"</p>
                )}
                <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mt-2">
                  <Star className="w-4 h-4" />
                  {Math.round(company.score * 100)}% match for your project
                </div>
              </div>
            </div>
            <button
              onClick={handleCloseProfile}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Company Overview */}
          <div>
            <h3 className="text-xl font-semibold text-[#2D2D2D] mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#fa744c]" />
              Company Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {company.metadata.industry && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Industry</span>
                  </div>
                  <p className="text-blue-800">{company.metadata.industry}</p>
                </div>
              )}
              
              {company.metadata.location && (
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Location</span>
                  </div>
                  <p className="text-green-800">{company.metadata.location}</p>
                </div>
              )}
              
              {company.metadata.employeeCount && (
                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Team Size</span>
                  </div>
                  <p className="text-purple-800">{company.metadata.employeeCount} employees</p>
                </div>
              )}
            </div>
            
            {company.metadata.description && (
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-3">About the Company</h4>
                <p className="text-gray-700 leading-relaxed">{company.metadata.description}</p>
              </div>
            )}
          </div>

          {/* Services */}
          {company.metadata.services && (
            <div>
              <h3 className="text-xl font-semibold text-[#2D2D2D] mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-[#fa744c]" />
                Services Offered
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {formatServices(company.metadata.services).map((service, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium text-center"
                  >
                    {service}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technologies */}
          {company.metadata.technologiesUsed && (
            <div>
              <h3 className="text-xl font-semibold text-[#2D2D2D] mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#fa744c]" />
                Technologies & Tools
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formatTechnologies(company.metadata.technologiesUsed).map((tech, idx) => (
                  <div
                    key={idx}
                    className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg text-sm font-medium text-center"
                  >
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing & Timeline */}
          {(company.metadata.costRange || company.metadata.deliveryDuration) && (
            <div>
              <h3 className="text-xl font-semibold text-[#2D2D2D] mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#fa744c]" />
                Pricing & Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {company.metadata.costRange && (
                  <div className="bg-green-50 p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-6 h-6 text-green-600" />
                      <span className="font-semibold text-green-900 text-lg">Budget Range</span>
                    </div>
                    <p className="text-green-800 text-xl font-bold">{company.metadata.costRange}</p>
                  </div>
                )}
                
                {company.metadata.deliveryDuration && (
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-6 h-6 text-blue-600" />
                      <span className="font-semibold text-blue-900 text-lg">Delivery Timeline</span>
                    </div>
                    <p className="text-blue-800 text-xl font-bold">{company.metadata.deliveryDuration}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-semibold text-[#2D2D2D] mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#fa744c]" />
              Contact Information
            </h3>
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {company.metadata.email && (
                  <a
                    href={`mailto:${company.metadata.email}`}
                    className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                  >
                    <Mail className="w-6 h-6 text-[#fa744c]" />
                    <div>
                      <span className="font-medium text-gray-900">Email</span>
                      <p className="text-[#fa744c]">{company.metadata.email}</p>
                    </div>
                  </a>
                )}
                
                {company.metadata.website && (
                  <a
                    href={company.metadata.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                  >
                    <Globe className="w-6 h-6 text-blue-600" />
                    <div>
                      <span className="font-medium text-gray-900">Website</span>
                      <p className="text-blue-600">Visit Website</p>
                    </div>
                  </a>
                )}
                
                {company.metadata.linkedinUrl && (
                  <a
                    href={company.metadata.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                  >
                    <Linkedin className="w-6 h-6 text-blue-700" />
                    <div>
                      <span className="font-medium text-gray-900">LinkedIn</span>
                      <p className="text-blue-700">Connect on LinkedIn</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button className="flex-1 bg-[#fa744c] hover:bg-[#e8633f] text-white py-4 px-6 rounded-xl font-semibold text-lg transition-colors">
              Contact Company
            </button>
            <button 
              onClick={handleCloseProfile}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-[#2D2D2D] flex items-center gap-2">
            <Target className="w-6 h-6 text-[#fa744c]" />
            Search Results
          </h3>
          <p className="text-gray-600 mt-1">
            Found {results.length} matching companies for: <span className="font-medium">"{query}"</span>
          </p>
        </div>
        <button
          onClick={onClearResults}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          Clear Results
        </button>
      </div>

      <div className="space-y-6">
        {results.map((result, index) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 rounded-xl p-6 hover:border-[#fa744c] hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-[#fa744c] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 text-[#fa744c]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-xl font-semibold text-[#2D2D2D]">
                      {result.metadata.name}
                    </h4>
                    <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      <Star className="w-3 h-3" />
                      {Math.round(result.score * 100)}% match
                    </div>
                  </div>
                  
                  {result.metadata.tagline && (
                    <p className="text-[#fa744c] italic mb-2">"{result.metadata.tagline}"</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    {result.metadata.industry && (
                      <span className="font-medium">{result.metadata.industry}</span>
                    )}
                    {result.metadata.location && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {result.metadata.location}
                        </div>
                      </>
                    )}
                    {result.metadata.employeeCount && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {result.metadata.employeeCount} employees
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {result.metadata.description && (
              <p className="text-gray-700 mb-4 leading-relaxed">
                {result.metadata.description}
              </p>
            )}

            {/* Services */}
            {result.metadata.services && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Services</h5>
                <div className="flex flex-wrap gap-2">
                  {formatServices(result.metadata.services).slice(0, 6).map((service, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      {service}
                    </span>
                  ))}
                  {formatServices(result.metadata.services).length > 6 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{formatServices(result.metadata.services).length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Technologies */}
            {result.metadata.technologiesUsed && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Technologies</h5>
                <div className="flex flex-wrap gap-2">
                  {formatTechnologies(result.metadata.technologiesUsed).slice(0, 6).map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                  {formatTechnologies(result.metadata.technologiesUsed).length > 6 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{formatTechnologies(result.metadata.technologiesUsed).length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Pricing & Timeline */}
            {(result.metadata.costRange || result.metadata.deliveryDuration) && (
              <div className="mb-4 flex gap-6 text-sm">
                {result.metadata.costRange && (
                  <div>
                    <span className="font-medium text-gray-700">Budget Range: </span>
                    <span className="text-green-600 font-medium">{result.metadata.costRange}</span>
                  </div>
                )}
                {result.metadata.deliveryDuration && (
                  <div>
                    <span className="font-medium text-gray-700">Timeline: </span>
                    <span className="text-blue-600 font-medium">{result.metadata.deliveryDuration}</span>
                  </div>
                )}
              </div>
            )}

            {/* Contact & Links */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                {result.metadata.email && (
                  <a
                    href={`mailto:${result.metadata.email}`}
                    className="flex items-center gap-1 text-[#fa744c] hover:text-[#e8633f] text-sm font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    Contact
                  </a>
                )}
                {result.metadata.website && (
                  <a
                    href={result.metadata.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
                {result.metadata.linkedinUrl && (
                  <a
                    href={result.metadata.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-700 hover:text-blue-900 text-sm font-medium"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {result.metadata.twitterUrl && (
                  <a
                    href={result.metadata.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sky-500 hover:text-sky-700 text-sm font-medium"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                )}
              </div>
              
              <button 
                onClick={() => handleViewProfile(result)}
                className="bg-[#fa744c] hover:bg-[#e8633f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                View Profile
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Company Profile Modal */}
      <AnimatePresence>
        {selectedCompany && (
          <CompanyProfileModal company={selectedCompany} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}