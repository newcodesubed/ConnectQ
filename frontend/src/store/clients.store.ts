import { create } from "zustand";
import axios, { AxiosError } from "axios";
import { companySearchService, type SearchResult } from "../services/companySearch.service";

const API_URL = "http://localhost:5000/api/clients";
axios.defaults.withCredentials = true;

export interface Client {
  id: string;
  userId: string;
  profilePicUrl?: string;
  contactNumber?: string;
  bio?: string;
  description?: string;
  status: 'open' | 'matched' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientData {
  profilePic?: File;
  contactNumber?: string;
  bio?: string;
  description?: string;
  status?: 'open' | 'matched' | 'closed';
}

export interface UpdateClientData {
  profilePic?: File;
  contactNumber?: string;
  bio?: string;
  description?: string;
  status?: 'open' | 'matched' | 'closed';
}

export interface OpenRequest {
  id: string;
  userId: string;
  profilePicUrl?: string;
  contactNumber?: string;
  bio?: string;
  description?: string;
  status: 'open';
  createdAt: string;
  updatedAt: string;
}

interface ClientState {
  client: Client | null;
  openRequests: OpenRequest[];
  searchResults: SearchResult[];
  searchLoading: boolean;
  loading: boolean;
  error: string | null;
  message: string | null;

  // Actions
  clearError: () => void;
  createClient: (data: CreateClientData) => Promise<void>;
  getMyClient: () => Promise<void>;
  updateClient: (id: string, data: UpdateClientData) => Promise<void>;
  updateClientStatus: (id: string, status: 'open' | 'matched' | 'closed') => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getOpenRequests: () => Promise<void>;
  searchCompanies: (query: string, topK?: number) => Promise<void>;
  clearSearchResults: () => void;
}

export const useClientStore = create<ClientState>((set) => ({
  client: null,
  openRequests: [],
  searchResults: [],
  searchLoading: false,
  loading: false,
  error: null,
  message: null,

  clearError: () => set({ error: null, message: null }),

  searchCompanies: async (query: string, topK: number = 10) => {
    set({ searchLoading: true, error: null });
    try {
      const results = await companySearchService.searchCompanies(query, topK);
      set({ 
        searchResults: results,
        searchLoading: false
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search companies';
      set({ 
        error: errorMessage,
        searchLoading: false,
        searchResults: []
      });
      throw err;
    }
  },

  clearSearchResults: () => set({ searchResults: [], error: null }),

  createClient: async (data: CreateClientData) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      
      // Add profile picture if provided
      if (data.profilePic) formData.append('profilePic', data.profilePic);
      
      // Add other fields
      if (data.contactNumber) formData.append('contactNumber', data.contactNumber);
      if (data.bio) formData.append('bio', data.bio);
      if (data.description) formData.append('description', data.description);
      if (data.status) formData.append('status', data.status);

      const response = await axios.post(`${API_URL}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        set({ 
          client: response.data.client, 
          loading: false,
          message: response.data.message 
        });
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      set({ 
        error: error.response?.data?.message || "Failed to create client profile", 
        loading: false 
      });
      throw error;
    }
  },

  getMyClient: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/me`);
      if (response.data.success) {
        set({ 
          client: response.data.client, 
          loading: false 
        });
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      set({ 
        error: error.response?.data?.message || "Failed to fetch client profile", 
        loading: false,
        client: null 
      });
    }
  },

  updateClient: async (id: string, data: UpdateClientData) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      
      // Add profile picture if provided
      if (data.profilePic) formData.append('profilePic', data.profilePic);
      
      // Add other fields (only if they are defined)
      if (data.contactNumber !== undefined) formData.append('contactNumber', data.contactNumber);
      if (data.bio !== undefined) formData.append('bio', data.bio);
      if (data.description !== undefined) formData.append('description', data.description);
      if (data.status !== undefined) formData.append('status', data.status);

      const response = await axios.put(`${API_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        set({ 
          client: response.data.client, 
          loading: false,
          message: response.data.message 
        });
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      set({ 
        error: error.response?.data?.message || "Failed to update client profile", 
        loading: false 
      });
      throw error;
    }
  },

  updateClientStatus: async (id: string, status: 'open' | 'matched' | 'closed') => {
    set({ loading: true, error: null });
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`, { status });
      
      if (response.data.success) {
        set({ 
          client: response.data.client, 
          loading: false,
          message: response.data.message 
        });
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      set({ 
        error: error.response?.data?.message || "Failed to update client status", 
        loading: false 
      });
      throw error;
    }
  },

  deleteClient: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      
      if (response.data.success) {
        set({ 
          client: null, 
          loading: false,
          message: response.data.message 
        });
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      set({ 
        error: error.response?.data?.message || "Failed to delete client profile", 
        loading: false 
      });
      throw error;
    }
  },

  getOpenRequests: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/open-requests`);
      if (response.data.success) {
        set({ 
          openRequests: response.data.requests, 
          loading: false 
        });
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      set({ 
        error: error.response?.data?.message || "Failed to fetch open requests", 
        loading: false,
        openRequests: [] 
      });
    }
  },
}));
