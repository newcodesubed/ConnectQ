import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user.model';

// --- CLIENT REQUESTS ---

export const clientRequests = pgTable('client_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Profile Info
  profilePicUrl: text('profile_pic_url'),
  contactNumber: text('contact_number'),
  bio: text('bio'), // short description about client

  // Natural language input
  description: text('description').notNull(), // user’s free-text request

//   // (Optional) processed data
//   embeddingId: text('embedding_id'), // reference to Pinecone vector ID
//   matchedCompanyIds: text('matched_company_ids').array(), // store IDs of top matches if you want caching

  // Meta
  status: text('status', { enum: ['open', 'matched', 'closed'] }).default('open'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// --- RELATIONS ---
export const clientRequestsRelations = relations(clientRequests, ({ one }) => ({
  owner: one(users, {
    fields: [clientRequests.userId],
    references: [users.id],
  }),
}));

// --- TYPES ---
export type ClientRequest = typeof clientRequests.$inferSelect;
export type NewClientRequest = typeof clientRequests.$inferInsert;
