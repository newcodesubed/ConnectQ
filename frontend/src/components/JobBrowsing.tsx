import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Search,
  RefreshCw,
  Heart,
  Check,
  X
} from "lucide-react";
import { jobBrowsingService, type ClientRequest } from "../services/jobBrowsing.service";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";

export default function JobBrowsing() {
  const [jobs, setJobs] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [expressedInterests, setExpressedInterests] = useState<Set<string>>(new Set());
  const [expressingInterest, setExpressingInterest] = useState<Set<string>>(new Set());

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [fetchedJobs, myInterests] = await Promise.all([
        jobBrowsingService.getOpenJobs(),
        jobBrowsingService.getMyInterests()
      ]);
      setJobs(fetchedJobs);
      
      // Mark which clients we've already expressed interest in
      const interestedClientIds = new Set(
        myInterests.map(interest => interest.clientId)
      );
      setExpressedInterests(interestedClientIds);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
    toast.success("Jobs refreshed!");
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      job.description?.toLowerCase().includes(searchLower) ||
      job.bio?.toLowerCase().includes(searchLower) ||
      job.user?.name?.toLowerCase().includes(searchLower)
    );
  });

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffMs = now.getTime() - posted.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  };

  const handleExpressInterest = async (job: ClientRequest) => {
    if (expressedInterests.has(job.id)) {
      toast.error("You've already expressed interest in this project");
      return;
    }

    setExpressingInterest(prev => new Set(prev).add(job.id));
    
    try {
      await jobBrowsingService.expressInterest(job.id);
      setExpressedInterests(prev => new Set(prev).add(job.id));
      toast.success("Interest expressed successfully! The client will be notified.");
    } catch (error: unknown) {
      console.error("Error expressing interest:", error);
      const errorMessage = error instanceof Error && 'response' in error && 
        error.response && typeof error.response === 'object' && 
        'data' in error.response && 
        error.response.data && typeof error.response.data === 'object' && 
        'message' in error.response.data 
          ? String(error.response.data.message) 
          : "Failed to express interest. Please try again.";
      toast.error(errorMessage);
    } finally {
      setExpressingInterest(prev => {
        const newSet = new Set(prev);
        newSet.delete(job.id);
        return newSet;
      });
    }
  };

  const handleContactClient = (job: ClientRequest) => {
    // Simple mailto for now
    const subject = encodeURIComponent(`Regarding your project: ${job.description?.substring(0, 50)}...`);
    const body = encodeURIComponent(`Hi ${job.user?.name || 'there'},\n\nI saw your project posting and would like to discuss how I can help.\n\nBest regards`);
    window.open(`mailto:${job.user?.email}?subject=${subject}&body=${body}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-[#fa744c]" />
            <div>
              <h1 className="text-3xl font-bold text-[#2D2D2D]">Available Projects</h1>
              <p className="text-gray-600">
                Found {filteredJobs.length} open project{filteredJobs.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-[#fa744c] hover:bg-[#e8633f] disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects by description, client name, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fa744c] focus:border-transparent"
          />
        </div>
      </motion.div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-12 text-center"
        >
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Projects Found</h3>
          <p className="text-gray-500">
            {searchTerm ? "No projects match your search criteria." : "No open projects available at the moment."}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {/* Client Avatar */}
                  {job.profilePicUrl ? (
                    <img
                      src={job.profilePicUrl}
                      alt={`${job.user?.name} avatar`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#fa744c]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#fa744c] bg-opacity-10 flex items-center justify-center">
                      <User className="w-6 h-6 text-[#fa744c]" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-[#2D2D2D]">
                        {job.user?.name || 'Anonymous Client'}
                      </h3>
                      <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        {timeAgo(job.createdAt)}
                      </div>
                    </div>
                    
                    {job.bio && (
                      <p className="text-sm text-gray-600 mb-2">{job.bio}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Project Description */}
              {job.description && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Project Description</h4>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-700 leading-relaxed">{job.description}</p>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {job.user?.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{job.user.email}</span>
                    </div>
                  )}
                  {job.contactNumber && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{job.contactNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Posted {timeAgo(job.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {expressedInterests.has(job.id) ? (
                    <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                      <Check className="w-4 h-4" />
                      Interest Expressed
                    </div>
                  ) : (
                    <button
                      onClick={() => handleExpressInterest(job)}
                      disabled={expressingInterest.has(job.id)}
                      className="flex items-center gap-2 bg-[#fa744c] hover:bg-[#e8633f] disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {expressingInterest.has(job.id) ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Expressing Interest...
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4" />
                          Mark as Interested
                        </>
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleContactClient(job)}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email Client
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}