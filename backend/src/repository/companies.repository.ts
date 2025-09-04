import { db } from '../db';
import { companies } from '../model/companies.model';
import { users } from '../model/user.model';
import { eq } from 'drizzle-orm';

export const CompanyRepository = {
  async findById(id: string) {
    const result = await db.select().from(companies).where(eq(companies.id, id));
    return result[0] || null;
  },

  async findByUserId(userId: string) {
    const result = await db.select().from(companies).where(eq(companies.userId, userId));
    return result[0] || null;
  },

  async create(companyData: {
    userId: string;
    name: string;
    email: string;
    description?: string;
    industry?: string;
    location?: string;
    contactNumber?: string;
  }) {
    const result = await db.insert(companies).values(companyData).returning();
    return result[0];
  },

  async update(id: string, updateData: Partial<{
    name: string;
    email: string;
    description?: string;
    industry?: string;
    location?: string;
    contactNumber?: string;
  }>) {
    const result = await db
      .update(companies)
      .set(updateData)
      .where(eq(companies.id, id))
      .returning();
    return result[0] || null;
  },

  async delete(id: string) {
    await db.delete(companies).where(eq(companies.id, id));
    return true;
  },

  async checkOwnership(companyId: string, userId: string) {
    const company = await this.findById(companyId);
    return company && company.userId === userId;
  },

  async findUserById(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }
};
