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
  name: text('name'), // Full name for display - made nullable for migration
  email: text('email'), // Contact email (could be different from user.email) - made nullable for migration
  imageUrl: text('image_url'), // Profile picture/avatar URL
  profilePicUrl: text('profile_pic_url'), // Legacy field - can be removed in migration
  contactNumber: text('contact_number'),
  bio: text('bio'),

  // Single search/request field (kept for backward compatibility)
  description: text('description'),  // the "requirement" in natural language
  status: text('status', { enum: ['open', 'matched', 'closed'] }).default('open'),

  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  // Note: jobs relation will be defined in jobs.model.ts to avoid circular imports
}));

// --- TYPES ---
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

