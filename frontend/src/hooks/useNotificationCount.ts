import { useState, useEffect } from 'react';
import { jobBrowsingService } from '../services/jobBrowsing.service';

export const useNotificationCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      const count = await jobBrowsingService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Don't show error to user, just log it
    } finally {
      setLoading(false);
    }
  };

  const decrementCount = () => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const resetCount = () => {
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    unreadCount,
    loading,
    fetchUnreadCount,
    decrementCount,
    resetCount
  };
};