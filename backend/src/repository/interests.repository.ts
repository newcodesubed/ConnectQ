import { db } from '../db';
import { interests } from '../model/interests.model';
import { companies } from '../model/companies.model';
import { clients } from '../model/clients.model';
import { users } from '../model/user.model';
import { eq, and, desc } from 'drizzle-orm';
import type { Interest, NewInterest } from '../model/interests.model';

export class InterestRepository {
  // Create a new interest (company showing interest in client's job)
  static async create(data: NewInterest): Promise<Interest> {
    const [newInterest] = await db.insert(interests).values(data).returning();
    return newInterest;
  }

  // Check if company already showed interest in a client
  static async findExisting(clientId: string, companyId: string): Promise<Interest | null> {
    const [existing] = await db
      .select()
      .from(interests)
      .where(and(
        eq(interests.clientId, clientId),
        eq(interests.companyId, companyId)
      ))
      .limit(1);
    
    return existing || null;
  }

  // Get all interests for a specific client (notifications)
  static async findByClientId(clientId: string): Promise<Array<Interest & { company: any; user: any }>> {
    return await db
      .select({
        id: interests.id,
        clientId: interests.clientId,
        companyId: interests.companyId,
        message: interests.message,
        status: interests.status,
        isRead: interests.isRead,
        createdAt: interests.createdAt,
        updatedAt: interests.updatedAt,
        company: {
          id: companies.id,
          name: companies.name,
          email: companies.email,
          logoUrl: companies.logoUrl,
          industry: companies.industry,
          location: companies.location,
        },
        user: {
          name: users.name,
          email: users.email,
        }
      })
      .from(interests)
      .innerJoin(companies, eq(interests.companyId, companies.id))
      .innerJoin(users, eq(companies.userId, users.id))
      .where(eq(interests.clientId, clientId))
      .orderBy(desc(interests.createdAt));
  }

  // Get all interests by a specific company
  static async findByCompanyId(companyId: string): Promise<Array<Interest & { client: any; user: any }>> {
    return await db
      .select({
        id: interests.id,
        clientId: interests.clientId,
        companyId: interests.companyId,
        message: interests.message,
        status: interests.status,
        isRead: interests.isRead,
        createdAt: interests.createdAt,
        updatedAt: interests.updatedAt,
        client: {
          id: clients.id,
          name: clients.name,
          email: clients.email,
          description: clients.description,
          profilePicUrl: clients.profilePicUrl,
          imageUrl: clients.imageUrl,
          contactNumber: clients.contactNumber,
          bio: clients.bio,
        },
        user: {
          name: users.name,
          email: users.email,
        }
      })
      .from(interests)
      .innerJoin(clients, eq(interests.clientId, clients.id))
      .innerJoin(users, eq(clients.userId, users.id))
      .where(eq(interests.companyId, companyId))
      .orderBy(desc(interests.createdAt));
  }

  // Mark interest as read (for notifications)
  static async markAsRead(id: string): Promise<Interest | null> {
    const [updated] = await db
      .update(interests)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(interests.id, id))
      .returning();
    
    return updated || null;
  }

  // Update interest status
  static async updateStatus(id: string, status: 'pending' | 'accepted' | 'rejected'): Promise<Interest | null> {
    const [updated] = await db
      .update(interests)
      .set({ status, updatedAt: new Date() })
      .where(eq(interests.id, id))
      .returning();
    
    return updated || null;
  }

  // Delete interest
  static async delete(id: string): Promise<void> {
    await db.delete(interests).where(eq(interests.id, id));
  }

  // Get unread count for a client
  static async getUnreadCount(clientId: string): Promise<number> {
    const result = await db
      .select({ count: interests.id })
      .from(interests)
      .where(and(
        eq(interests.clientId, clientId),
        eq(interests.isRead, false)
      ));
    
    return result.length;
  }
}