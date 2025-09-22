import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { clients } from './clients.model';
import { companies } from './companies.model';

// --- INTERESTS (Simple interest tracking) ---
export const interests = pgTable('interests', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  
  // Interest details
  message: text('message'), // Optional message from company
  status: text('status', { enum: ['pending', 'accepted', 'rejected'] }).default('pending'),
  isRead: boolean('is_read').default(false), // For notification purposes
  
  // System timestamps
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

// --- RELATIONS ---
export const interestsRelations = relations(interests, ({ one }) => ({
  client: one(clients, {
    fields: [interests.clientId],
    references: [clients.id],
  }),
  company: one(companies, {
    fields: [interests.companyId],
    references: [companies.id],
  }),
}));

// --- TYPES ---
export type Interest = typeof interests.$inferSelect;
export type NewInterest = typeof interests.$inferInsert;