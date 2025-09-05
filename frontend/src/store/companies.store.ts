import { create } from "zustand";
import axios, { AxiosError } from "axios";

const API_URL = "http://localhost:5000/api/companies";
axios.defaults.withCredentials = true;

export interface Company {
  id: string;
  userId: string;
  name: string;
  email: string;
  description?: string;
  industry?: string;
  location?: string;
  contactNumber?: string;
  createdAt: string;
}

export interface CreateCompanyData {
  name: string;
  email: string;
  description?: string;
  industry?: string;
  location?: string;
  contactNumber?: string;
}

export interface UpdateCompanyData {
  name?: string;
  email?: string;
  description?: string;
  industry?: string;
  location?: string;
  contactNumber?: string;
}

interface CompanyState {
  company: Company | null;
  loading: boolean;
  error: string | null;
  message: string | null;

  // Actions
  clearError: () => void;
  createCompany: (data: CreateCompanyData) => Promise<void>;
  getMyCompany: () => Promise<void>;
  updateCompany: (id: string, data: UpdateCompanyData) => Promise<void>;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  company: null,
  loading: false,
  error: null,
  message: null,

  clearError: () => set({ error: null, message: null }),

  createCompany: async (data: CreateCompanyData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}`, data);
      if (response.data.success) {
        set({ 
          company: response.data.company, 
          loading: false,
          message: response.data.message 
        });
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      set({ 
        error: error.response?.data?.message || "Failed to create company", 
        loading: false 
      });
      throw error;
    }
  },

  getMyCompany: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/me`);
      if (response.data.success) {
        set({ 
          company: response.data.company, 
          loading: false 
        });
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      set({ 
        error: error.response?.data?.message || "Failed to fetch company", 
        loading: false,
        company: null 
      });
    }
  },

  updateCompany: async (id: string, data: UpdateCompanyData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      if (response.data.success) {
        set({ 
          company: response.data.company, 
          loading: false,
          message: response.data.message 
        });
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      set({ 
        error: error.response?.data?.message || "Failed to update company", 
        loading: false 
      });
      throw error;
    }
  },
}));