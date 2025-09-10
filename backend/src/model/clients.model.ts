import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user.model';

// --- CLIENTS ---
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  profilePicUrl: text('profile_pic_url'),
  contactNumber: text('contact_number'),
  bio: text('bio'),

  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// --- CLIENT REQUESTS ---
export const clientRequests = pgTable('client_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),

  description: text('description').notNull(),
  status: text('status', { enum: ['open', 'matched', 'closed'] }).default('open'),

  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// --- RELATIONS ---
// User ↔ Client (1:1)
export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  requests: many(clientRequests),
}));

// Client ↔ ClientRequests (1:N)
export const clientRequestsRelations = relations(clientRequests, ({ one }) => ({
  client: one(clients, {
    fields: [clientRequests.clientId],
    references: [clients.id],
  }),
}));

// --- TYPES ---
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export type ClientRequest = typeof clientRequests.$inferSelect;
export type NewClientRequest = typeof clientRequests.$inferInsert;
