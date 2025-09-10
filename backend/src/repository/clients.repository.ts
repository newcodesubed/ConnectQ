import { db } from '../db';
import { clients } from '../model/clients.model';
import { users } from '../model/user.model';
import { eq } from 'drizzle-orm';

export const ClientRepository = {
  async findById(id: string) {
    const result = await db.select().from(clients).where(eq(clients.id, id));
    return result[0] || null;
  },

  async findByUserId(userId: string) {
    const result = await db.select().from(clients).where(eq(clients.userId, userId));
    return result[0] || null;
  },

  async create(clientData: {
    userId: string;
    profilePicUrl?: string;
    contactNumber?: string;
    bio?: string;
    description?: string;
    status?: 'open' | 'matched' | 'closed';
  }) {
    const result = await db.insert(clients).values(clientData).returning();
    return result[0];
  },

  async update(id: string, updateData: Partial<{
    profilePicUrl?: string;
    contactNumber?: string;
    bio?: string;
    description?: string;
    status?: 'open' | 'matched' | 'closed';
    updatedAt?: Date;
  }>) {
    // Add updated timestamp
    const dataWithTimestamp = {
      ...updateData,
      updatedAt: new Date()
    };

    const result = await db
      .update(clients)
      .set(dataWithTimestamp)
      .where(eq(clients.id, id))
      .returning();
    return result[0] || null;
  },

  async delete(id: string) {
    await db.delete(clients).where(eq(clients.id, id));
    return true;
  },

  async checkOwnership(clientId: string, userId: string) {
    const client = await this.findById(clientId);
    return client && client.userId === userId;
  },

  async findUserById(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  },

  // Get all clients with specific status
  async findByStatus(status: 'open' | 'matched' | 'closed') {
    const result = await db.select().from(clients).where(eq(clients.status, status));
    return result;
  },

  // Get all open client requests (for companies to browse)
  async findOpenRequests() {
    const result = await db.select().from(clients).where(eq(clients.status, 'open'));
    return result;
  }
};
