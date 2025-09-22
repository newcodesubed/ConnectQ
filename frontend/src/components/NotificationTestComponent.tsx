import { useState, useEffect } from "react";
import { jobBrowsingService } from "../services/jobBrowsing.service";
import { toast } from "react-hot-toast";

export default function NotificationTestComponent() {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Testing notification endpoints...");
      
      // Test unread count
      const count = await jobBrowsingService.getUnreadCount();
      console.log("Unread count:", count);
      setUnreadCount(count);
      
      // Test received interests
      const receivedInterests = await jobBrowsingService.getReceivedInterests();
      console.log("Received interests:", receivedInterests);
      setInterests(receivedInterests);
      
      toast.success("Notification test completed!");
    } catch (err: any) {
      console.error("Notification test error:", err);
      setError(err.message || "Test failed");
      toast.error("Notification test failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const testMarkAsRead = async (interestId: string) => {
    try {
      await jobBrowsingService.markAsRead(interestId);
      toast.success("Marked as read successfully!");
      // Refresh after marking as read
      testNotifications();
    } catch (err: any) {
      console.error("Mark as read error:", err);
      toast.error("Failed to mark as read");
    }
  };

  const testStatusUpdate = async (interestId: string, status: 'accepted' | 'rejected') => {
    try {
      const updated = await jobBrowsingService.updateInterestStatus(interestId, status);
      console.log("Updated interest:", updated);
      toast.success(`Interest ${status} successfully!`);
      // Refresh after status update
      testNotifications();
    } catch (err: any) {
      console.error("Status update error:", err);
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    testNotifications();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Notification System Test</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={testNotifications}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded"
            >
              {loading ? "Testing..." : "Test Notifications"}
            </button>
            
            <div className="text-sm">
              Unread Count: <span className="font-bold text-red-500">{unreadCount}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Received Interests ({interests.length})
            </h3>
            
            {interests.length === 0 ? (
              <div className="text-gray-500">No interests found</div>
            ) : (
              <div className="space-y-3">
                {interests.map((interest, index) => (
                  <div key={interest.id || index} className="border rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">
                          Company: {interest.company?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Status: {interest.status}
                        </div>
                        <div className="text-sm text-gray-600">
                          Read: {interest.isRead ? 'Yes' : 'No'}
                        </div>
                        {interest.message && (
                          <div className="text-sm text-gray-700 mt-2">
                            Message: {interest.message}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {!interest.isRead && (
                          <button
                            onClick={() => testMarkAsRead(interest.id)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Mark Read
                          </button>
                        )}
                        
                        {interest.status === 'pending' && (
                          <>
                            <button
                              onClick={() => testStatusUpdate(interest.id, 'accepted')}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => testStatusUpdate(interest.id, 'rejected')}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-2">
                      <pre>{JSON.stringify(interest, null, 2)}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}