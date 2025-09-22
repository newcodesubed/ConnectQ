import axios from 'axios';

const API_URL = "http://localhost:5000/api";
axios.defaults.withCredentials = true;

export interface ClientRequest {
  id: string;
  userId: string;
  profilePicUrl: string | null;
  contactNumber: string | null;
  bio: string | null;
  description: string | null;
  status: 'open' | 'matched' | 'closed';
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface Interest {
  id: string;
  clientId: string;
  companyId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    user?: {
      name: string;
      email: string;
    };
  };
  company?: {
    id: string;
    name: string;
    email: string;
    logoUrl?: string;
    industry?: string;
    location?: string;
    user?: {
      name: string;
      email: string;
    };
  };
}

export interface JobBrowsingResponse {
  success: boolean;
  requests: ClientRequest[];
  count: number;
}

export const jobBrowsingService = {
  // Get all open client requests (jobs)
  async getOpenJobs(): Promise<ClientRequest[]> {
    try {
      const response = await axios.get<JobBrowsingResponse>(`${API_URL}/clients/open-requests`);
      if (response.data.success) {
        return response.data.requests;
      }
      throw new Error('Failed to fetch jobs');
    } catch (error) {
      console.error('Error fetching open jobs:', error);
      throw error;
    }
  },

  // Express interest in a client's project
  async expressInterest(clientId: string, message?: string): Promise<Interest> {
    try {
      const response = await axios.post(`${API_URL}/interests/express/${clientId}`, {
        message
      });
      return response.data.interest;
    } catch (error) {
      console.error('Error expressing interest:', error);
      throw error;
    }
  },

  // Get my company's expressed interests
  async getMyInterests(): Promise<Interest[]> {
    try {
      const response = await axios.get(`${API_URL}/interests/my`);
      return response.data.interests || [];
    } catch (error) {
      console.error('Error fetching my interests:', error);
      throw error;
    }
  },

  // Get interests received by client (client-only)
  async getReceivedInterests(): Promise<Interest[]> {
    try {
      const response = await axios.get(`${API_URL}/interests/received`);
      return response.data.interests || [];
    } catch (error) {
      console.error('Error fetching received interests:', error);
      throw error;
    }
  },

  // Get unread interest count (client-only)
  async getUnreadCount(): Promise<number> {
    try {
      const response = await axios.get(`${API_URL}/interests/unread-count`);
      return response.data.unreadCount || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  // Mark interest as read (client-only)
  async markAsRead(interestId: string): Promise<void> {
    try {
      await axios.patch(`${API_URL}/interests/${interestId}/read`);
    } catch (error) {
      console.error('Error marking interest as read:', error);
      throw error;
    }
  },

  // Update interest status (client-only)
  async updateInterestStatus(interestId: string, status: 'accepted' | 'rejected'): Promise<Interest> {
    try {
      const response = await axios.patch(`${API_URL}/interests/${interestId}/status`, {
        status
      });
      return response.data.interest;
    } catch (error) {
      console.error('Error updating interest status:', error);
      throw error;
    }
  },

  // Contact a client about their job posting (legacy method)
  async contactClient(clientId: string, message: string): Promise<void> {
    try {
      // For now, this could just be a simple email or message
      // You can implement this based on your needs
      console.log(`Contacting client ${clientId} with message: ${message}`);
      // TODO: Implement actual contact functionality
    } catch (error) {
      console.error('Error contacting client:', error);
      throw error;
    }
  }
};