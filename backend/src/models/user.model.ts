import { pool } from "../db";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "client" | "company";
  is_verified: boolean;
  last_login: Date;
  reset_password_token?: string | null;
  reset_password_expires_at?: Date | null;
  verification_token?: string | null;
  verification_expires_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export const UserModel = {
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    return result.rows[0] || null;
  },

  async create(user: Partial<User>): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (email, password, name, role, verification_token, verification_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        user.email,
        user.password,
        user.name,
        user.role,
        user.verification_token,
        user.verification_expires_at,
      ]
    );
    return result.rows[0];
  },

  async verifyUser(token: string): Promise<User | null> {
    const result = await pool.query(
      `UPDATE users
       SET is_verified=true, verification_token=NULL, verification_expires_at=NULL
       WHERE verification_token=$1 AND verification_expires_at > NOW()
       RETURNING *`,
      [token]
    );
    return result.rows[0] || null;
  },
};
