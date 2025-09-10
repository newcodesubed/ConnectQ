import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user.model';

// --- CLIENTS ---
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Profile Info
  profilePicUrl: text('profile_pic_url'),
  contactNumber: text('contact_number'),
  bio: text('bio'),

  // Single search/request field
  description: text('description'),  // the "requirement" in natural language
  status: text('status', { enum: ['open', 'matched', 'closed'] }).default('open'),

  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

export const clientsRelations = relations(clients, ({ one }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
}));

// --- TYPES ---
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

