export type Role = "client" | "company";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  is_verified: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}
