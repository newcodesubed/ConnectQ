import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, User, Mail, Calendar } from 'lucide-react';
import { jobBrowsingService, type Interest } from '../services/jobBrowsing.service';

export default function CompanyInterestTracker() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyInterests();
  }, []);

  const fetchMyInterests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobBrowsingService.getMyInterests();
      setInterests(response);
    } catch (err) {
      setError('Failed to fetch your interests');
      console.error('Error fetching interests:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'accepted':
        return {
          icon: CheckCircle,
          text: 'Accepted',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'rejected':
        return {
          icon: XCircle,
          text: 'Rejected',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: Clock,
          text: 'Pending',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fa744c]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchMyInterests}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (interests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Interests Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            You haven't expressed interest in any clients yet. Browse projects and start connecting with potential clients!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Interest Status</h2>
        <p className="text-gray-600">{interests.length} total interests</p>
      </div>

      <div className="grid gap-4">
        {interests.map((interest, index) => {
          const statusInfo = getStatusInfo(interest.status);
          const StatusIcon = statusInfo.icon;
          
          // Handle client data structure
          const clientName = interest.client?.name || interest.user?.name || 'Unknown Client';
          const clientEmail = interest.client?.email || interest.user?.email || 'No email available';
          const clientProfilePic = interest.client?.profilePicUrl || interest.client?.imageUrl;

          return (
            <motion.div
              key={interest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${statusInfo.borderColor}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Client Avatar */}
                  <div className="w-12 h-12 bg-[#fa744c] rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                    {clientProfilePic ? (
                      <img
                        src={clientProfilePic}
                        alt={clientName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      clientName.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Client Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {clientName}
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm truncate">{clientEmail}</span>
                      </div>
                      
                      {interest.client?.contactNumber && (
                        <div className="flex items-center text-gray-600">
                          <User className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">{interest.client.contactNumber}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">Expressed interest on {formatDate(interest.createdAt)}</span>
                      </div>
                    </div>

                    {(interest.client?.description || interest.client?.bio) && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-sm">
                          <span className="font-medium">Project Details:</span><br />
                          {interest.client.description || interest.client.bio}
                        </p>
                      </div>
                    )}

                    {interest.message && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 text-sm">
                          <span className="font-medium">Your message:</span> {interest.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
                  <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                  <span className={`text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>
              </div>

              {/* Additional Status Message */}
              {interest.status === 'accepted' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    🎉 Great news! This client has accepted your interest. You can now contact them directly at {clientEmail}
                  </p>
                </div>
              )}
              
              {interest.status === 'rejected' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">
                    This client has declined your interest. Keep exploring other opportunities!
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}