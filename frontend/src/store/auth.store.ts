import { create } from "zustand";
import { api } from "../api/axios";
import type { AuthResponse, Role, User } from "../types/auth.type";

interface AuthState {
  user: User | null;
  roleChoice: Role | null; // chosen in the pre-step page
  loading: boolean;
  error: string | null;

  setRoleChoice: (role: Role) => void;
  clearError: () => void;

  checkAuth: () => Promise<void>;
  signup: (payload: { name: string; email: string; password: string }) => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  roleChoice: null,
  loading: false,
  error: null,

  setRoleChoice: (role) => set({ roleChoice: role }),
  clearError: () => set({ error: null }),

  checkAuth: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<AuthResponse>("/auth/check-auth");
      if (data.success && data.user) set({ user: data.user });
    } catch (e: any) {
      set({ user: null }); // not logged in
    } finally {
      set({ loading: false });
    }
  },

  signup: async ({ name, email, password }) => {
    const role = get().roleChoice;
    if (!role) {
      set({ error: "Please select a role first." });
      return;
    }
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<AuthResponse>("/auth/signup", {
        name, email, password, role,
      });
      if (data.success && data.user) set({ user: data.user });
    } catch (e: any) {
      set({ error: e?.response?.data?.message || "Signup failed" });
    } finally {
      set({ loading: false });
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
      if (data.success && data.user) set({ user: data.user });
    } catch (e: any) {
      set({ error: e?.response?.data?.message || "Login failed" });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await api.post("/auth/logout");
      set({ user: null });
    } catch (e: any) {
      set({ error: e?.response?.data?.message || "Logout failed" });
    } finally {
      set({ loading: false });
    }
  },

  verifyEmail: async (code: string) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<AuthResponse>("/auth/verify-email", { code });
      if (data.success && data.user) set({ user: data.user });
    } catch (e: any) {
      set({ error: e?.response?.data?.message || "Verification failed" });
    } finally {
      set({ loading: false });
    }
  },

  forgotPassword: async (email: string) => {
    set({ loading: true, error: null });
    try {
      await api.post("/auth/forget-password", { email });
    } catch (e: any) {
      set({ error: e?.response?.data?.message || "Request failed" });
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (token: string, password: string) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
    } catch (e: any) {
      set({ error: e?.response?.data?.message || "Reset failed" });
    } finally {
      set({ loading: false });
    }
  },
}));
