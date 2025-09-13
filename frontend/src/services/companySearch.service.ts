import axios, { AxiosError } from "axios";

const API_URL = "http://localhost:5000/api/embeddings";
axios.defaults.withCredentials = true;

export interface SearchResult {
  id: string;
  score: number;
  metadata: {
    id: string;
    name: string;
    email: string;
    industry?: string;
    location?: string;
    description?: string;
    website?: string;
    tagline?: string;
    logoUrl?: string;
    services?: string;
    technologiesUsed?: string;
    specializations?: string;
    employeeCount?: number;
    costRange?: string;
    deliveryDuration?: string;
    contactNumber?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    chunk_text?: string;
    embedded_at?: string;
    // Debug information
    matching_chunks?: number;
    weighted_score?: number;
    chunk_details?: Array<{
      score: number;
      chunk_type: string;
      importance: number;
      text: string;
    }>;
  };
}

export interface SearchResponse {
  success: boolean;
  message: string;
  matches: SearchResult[];
  count: number;
}

class CompanySearchService {
  /**
   * Search companies using semantic embedding search
   */
  async searchCompanies(query: string, topK: number = 10): Promise<SearchResult[]> {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Search query is required');
      }

      const response = await axios.post<SearchResponse>(`${API_URL}/search-companies`, {
        query: query.trim(),
        topK
      });

      if (response.data.success) {
        return response.data.matches || [];
      } else {
        throw new Error(response.data.message || 'Search failed');
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage = error.response?.data?.message || 'Failed to search companies';
      console.error('Company search error:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Check embedding service status
   */
  async getStatus(): Promise<{ success: boolean; message: string; timestamp: string }> {
    try {
      const response = await axios.get(`${API_URL}/status`);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      throw new Error(error.response?.data?.message || 'Failed to check service status');
    }
  }
}

export const companySearchService = new CompanySearchService();
export default companySearchService;