import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { clients } from './clients.model';

// --- JOBS ---
export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  
  // Job details
  title: text('title').notNull(),
  description: text('description').notNull(),
  requirements: text('requirements'), // Optional detailed requirements
  budget: text('budget'), // e.g., "$5k-$15k" or "Fixed: $10k"
  timeline: text('timeline'), // e.g., "2-4 weeks"
  status: text('status', { enum: ['open', 'in_progress', 'completed', 'cancelled'] }).default('open'),
  
  // System timestamps
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

// --- RELATIONS ---
export const jobsRelations = relations(jobs, ({ one, many }) => ({
  client: one(clients, {
    fields: [jobs.clientId],
    references: [clients.id],
  }),
  // Note: applications relation will be defined in applications.model.ts to avoid circular imports
}));

// --- TYPES ---
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;