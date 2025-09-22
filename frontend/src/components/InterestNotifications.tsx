import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Heart, 
  Check, 
  X, 
  Building2, 
  Calendar,
  RefreshCw,
  Mail
} from "lucide-react";
import { jobBrowsingService, type Interest } from "../services/jobBrowsing.service";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";

export default function InterestNotifications() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());

  const fetchInterests = async () => {
    try {
      setLoading(true);
      const [receivedInterests, count] = await Promise.all([
        jobBrowsingService.getReceivedInterests(),
        jobBrowsingService.getUnreadCount()
      ]);
      setInterests(receivedInterests);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching interests:", error);
      toast.error("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInterests();
    setRefreshing(false);
    toast.success("Notifications refreshed!");
  };

  const handleMarkAsRead = async (interestId: string) => {
    try {
      await jobBrowsingService.markAsRead(interestId);
      setInterests(prev => 
        prev.map(interest => 
          interest.id === interestId 
            ? { ...interest, isRead: true }
            : interest
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  const handleStatusUpdate = async (interestId: string, status: 'accepted' | 'rejected') => {
    setUpdatingStatus(prev => new Set(prev).add(interestId));
    
    try {
      const updatedInterest = await jobBrowsingService.updateInterestStatus(interestId, status);
      setInterests(prev => 
        prev.map(interest => 
          interest.id === interestId 
            ? updatedInterest
            : interest
        )
      );
      toast.success(`Interest ${status} successfully!`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update interest status");
    } finally {
      setUpdatingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(interestId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-8 h-8 text-[#fa744c]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#2D2D2D]">Interest Notifications</h1>
              <p className="text-gray-600">
                {interests.length} total notification{interests.length !== 1 ? 's' : ''} 
                {unreadCount > 0 && ` • ${unreadCount} unread`}
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
      </motion.div>

      {/* Notifications List */}
      {interests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-12 text-center"
        >
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Notifications</h3>
          <p className="text-gray-500">
            You haven't received any interest notifications yet.
          </p>
        </motion.div>
      ) : (
        <AnimatePresence>
          {interests.map((interest, index) => (
            <motion.div
              key={interest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow ${
                !interest.isRead ? 'ring-2 ring-[#fa744c] ring-opacity-20' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#fa744c] bg-opacity-10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-[#fa744c]" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-[#2D2D2D]">
                        {interest.company?.name || 'Company'}
                      </h3>
                      {!interest.isRead && (
                        <span className="bg-[#fa744c] text-white px-2 py-1 rounded-full text-xs font-medium">
                          New
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Calendar className="w-3 h-3" />
                        {timeAgo(interest.createdAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[#fa744c] mb-3">
                      <Heart className="w-4 h-4" />
                      <span className="font-medium">Expressed interest in your project</span>
                    </div>

                    {interest.message && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <p className="text-gray-700">{interest.message}</p>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        interest.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : interest.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {interest.status.charAt(0).toUpperCase() + interest.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {!interest.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(interest.id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-[#fa744c] transition-colors text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    Mark as read
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              {interest.status === 'pending' && (
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleStatusUpdate(interest.id, 'accepted')}
                    disabled={updatingStatus.has(interest.id)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {updatingStatus.has(interest.id) ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Accept
                  </button>
                  
                  <button
                    onClick={() => handleStatusUpdate(interest.id, 'rejected')}
                    disabled={updatingStatus.has(interest.id)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {updatingStatus.has(interest.id) ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    Reject
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}