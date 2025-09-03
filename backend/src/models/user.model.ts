import { db } from '../db';
import { users } from '../db/schema';
import { eq, and, gt } from 'drizzle-orm';

export const UserModel = {
  async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  },

  async create(userData: {
    email: string;
    password: string;
    name: string;
    role: 'client' | 'company';
    verificationToken?: string;
    verificationExpiresAt?: Date;
  }) {
    const result = await db.insert(users).values({
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: userData.role,
      verificationToken: userData.verificationToken,
      verificationExpiresAt: userData.verificationExpiresAt,
    }).returning();
    return result[0];
  },

  async verifyUser(token: string) {
    const result = await db
      .update(users)
      .set({
        isVerified: true,
        verificationToken: null,
        verificationExpiresAt: null,
      })
      .where(
        and(
          eq(users.verificationToken, token),
          gt(users.verificationExpiresAt, new Date())
        )
      )
      .returning();
    return result[0] || null;
  },

  async updateLastLogin(userId: string) {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, userId));
  },

  async setResetToken(userId: string, token: string, expiresAt: Date) {
    await db
      .update(users)
      .set({
        resetPasswordToken: token,
        resetPasswordExpiresAt: expiresAt,
      })
      .where(eq(users.id, userId));
  },

  async findByResetToken(token: string) {
    const result = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetPasswordToken, token),
          gt(users.resetPasswordExpiresAt, new Date())
        )
      );
    return result[0] || null;
  },

  async updatePassword(userId: string, newPassword: string) {
    await db
      .update(users)
      .set({
        password: newPassword,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
      })
      .where(eq(users.id, userId));
  },

  async findById(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  },
};