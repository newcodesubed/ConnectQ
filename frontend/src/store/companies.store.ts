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
  // Branding
  logoUrl?: string;
  website?: string;
  tagline?: string;
  foundedAt?: string;
  // Offerings
  services?: string[];
  technologiesUsed?: string[];
  costRange?: string;
  deliveryDuration?: string;
  specializations?: string[];
  // Scale
  employeeCount?: number;
  // Reputation
  reviews?: string[];
  // Social Links
  linkedinUrl?: string;
  twitterUrl?: string;
  // System
  createdAt: string;
}

export interface CreateCompanyData {
  name: string;
  email: string;
  description?: string;
  industry?: string;
  location?: string;
  contactNumber?: string;
  // Branding
  logo?: File;
  website?: string;
  tagline?: string;
  foundedAt?: string;
  // Offerings
  services?: string[];
  technologiesUsed?: string[];
  costRange?: string;
  deliveryDuration?: string;
  specializations?: string[];
  // Scale
  employeeCount?: number;
  // Reputation
  reviews?: string[];
  // Social Links
  linkedinUrl?: string;
  twitterUrl?: string;
}

export interface UpdateCompanyData {
  name?: string;
  email?: string;
  description?: string;
  industry?: string;
  location?: string;
  contactNumber?: string;
  // Branding
  logo?: File;
  website?: string;
  tagline?: string;
  foundedAt?: string;
  // Offerings
  services?: string[];
  technologiesUsed?: string[];
  costRange?: string;
  deliveryDuration?: string;
  specializations?: string[];
  // Scale
  employeeCount?: number;
  // Reputation
  reviews?: string[];
  // Social Links
  linkedinUrl?: string;
  twitterUrl?: string;
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
      const formData = new FormData();
      
      // Basic fields
      formData.append('name', data.name);
      formData.append('email', data.email);
      if (data.description) formData.append('description', data.description);
      if (data.industry) formData.append('industry', data.industry);
      if (data.location) formData.append('location', data.location);
      if (data.contactNumber) formData.append('contactNumber', data.contactNumber);
      
      // Branding
      if (data.logo) formData.append('logo', data.logo);
      if (data.website) formData.append('website', data.website);
      if (data.tagline) formData.append('tagline', data.tagline);
      if (data.foundedAt) formData.append('foundedAt', data.foundedAt);
      
      // Offerings
      if (data.services) formData.append('services', JSON.stringify(data.services));
      if (data.technologiesUsed) formData.append('technologiesUsed', JSON.stringify(data.technologiesUsed));
      if (data.costRange) formData.append('costRange', data.costRange);
      if (data.deliveryDuration) formData.append('deliveryDuration', data.deliveryDuration);
      if (data.specializations) formData.append('specializations', JSON.stringify(data.specializations));
      
      // Scale
      if (data.employeeCount) formData.append('employeeCount', data.employeeCount.toString());
      
      // Reputation
      if (data.reviews) formData.append('reviews', JSON.stringify(data.reviews));
      
      // Social Links
      if (data.linkedinUrl) formData.append('linkedinUrl', data.linkedinUrl);
      if (data.twitterUrl) formData.append('twitterUrl', data.twitterUrl);

      const response = await axios.post(`${API_URL}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
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
      const formData = new FormData();
      
      // Basic fields
      if (data.name !== undefined) formData.append('name', data.name);
      if (data.email !== undefined) formData.append('email', data.email);
      if (data.description !== undefined) formData.append('description', data.description);
      if (data.industry !== undefined) formData.append('industry', data.industry);
      if (data.location !== undefined) formData.append('location', data.location);
      if (data.contactNumber !== undefined) formData.append('contactNumber', data.contactNumber);
      
      // Branding
      if (data.logo) formData.append('logo', data.logo);
      if (data.website !== undefined) formData.append('website', data.website);
      if (data.tagline !== undefined) formData.append('tagline', data.tagline);
      if (data.foundedAt !== undefined) formData.append('foundedAt', data.foundedAt);
      
      // Offerings
      if (data.services !== undefined) formData.append('services', JSON.stringify(data.services));
      if (data.technologiesUsed !== undefined) formData.append('technologiesUsed', JSON.stringify(data.technologiesUsed));
      if (data.costRange !== undefined) formData.append('costRange', data.costRange);
      if (data.deliveryDuration !== undefined) formData.append('deliveryDuration', data.deliveryDuration);
      if (data.specializations !== undefined) formData.append('specializations', JSON.stringify(data.specializations));
      
      // Scale
      if (data.employeeCount !== undefined) formData.append('employeeCount', data.employeeCount.toString());
      
      // Reputation
      if (data.reviews !== undefined) formData.append('reviews', JSON.stringify(data.reviews));
      
      // Social Links
      if (data.linkedinUrl !== undefined) formData.append('linkedinUrl', data.linkedinUrl);
      if (data.twitterUrl !== undefined) formData.append('twitterUrl', data.twitterUrl);

      const response = await axios.put(`${API_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
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