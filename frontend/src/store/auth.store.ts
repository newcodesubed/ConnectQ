// src/store/auth.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "axios";

const API_URL = "http://localhost:5000/api/auth";
axios.defaults.withCredentials = true;

export type Role = "client" | "company";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  is_verified: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  roleChoice: Role | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  message: string | null;

  setRoleChoice: (role: Role) => void;
  clearError: () => void;

  checkAuth: () => Promise<void>;
  signup: (email: string, password: string, name: string, role?: Role) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verifyEmail: (code: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      roleChoice: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      message: null,

      setRoleChoice: (role) => set({ roleChoice: role }),
      clearError: () => set({ error: null }),

      checkAuth: async () => {
        set({ loading: true, error: null });
        try {
          const { data } = await axios.get(`${API_URL}/check-auth`);
          if (data.user) {
            set({ user: data.user, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch {
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ loading: false });
        }
      },

      signup: async (email, password, name, role) => {
        const chosenRole = role || get().roleChoice;
        if (!chosenRole) {
          set({ error: "Please select a role first." });
          return;
        }

        set({ loading: true, error: null });
        try {
          const { data } = await axios.post(`${API_URL}/signup`, {
            email,
            password,
            name,
            role: chosenRole,
          });

          if (data.user) {
            set({ user: data.user, isAuthenticated: true });
          }
        } catch (err) {
          const error = err as AxiosError<{ message: string }>;
          set({ error: error.response?.data?.message || "Signup failed" });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await axios.post(`${API_URL}/login`, { email, password });
          if (data.user) {
            set({ user: data.user, isAuthenticated: true });
          }
        } catch (err) {
          const error = err as AxiosError<{ message: string }>;
          set({ error: error.response?.data?.message || "Login failed" });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        set({ loading: true, error: null });
        try {
          await axios.post(`${API_URL}/logout`);
          set({
            user: null,
            isAuthenticated: false,
            roleChoice: null, // 👈 clear roleChoice on logout
          });
        } catch {
          set({ error: "Logout failed" });
        } finally {
          set({ loading: false });
        }
      },

      verifyEmail: async (code) => {
        set({ loading: true, error: null });
        try {
          const { data } = await axios.post(`${API_URL}/verify-email`, { code });
          if (data.user) set({ user: data.user, isAuthenticated: true });
          return data;
        } catch (err) {
          const error = err as AxiosError<{ message: string }>;
          set({ error: error.response?.data?.message || "Verification failed" });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      forgotPassword: async (email) => {
        set({ loading: true, error: null });
        try {
          const { data } = await axios.post(`${API_URL}/forget-password`, { email });
          set({ message: data.message });
        } catch (err) {
          const error = err as AxiosError<{ message: string }>;
          set({ error: error.response?.data?.message || "Forgot password failed" });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      resetPassword: async (token, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await axios.post(`${API_URL}/reset-password/${token}`, { password });
          set({ message: data.message });
        } catch (err) {
          const error = err as AxiosError<{ message: string }>;
          set({ error: error.response?.data?.message || "Reset password failed" });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "auth-storage", // key in localStorage
      partialize: (state) => ({ roleChoice: state.roleChoice }), // 👈 only persist roleChoice
    }
  )
);
