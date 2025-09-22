import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { jobs } from './jobs.model';
import { companies } from './companies.model';

// --- APPLICATIONS ---
export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => jobs.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  
  // Application details
  message: text('message'), // Optional cover letter/message from company
  status: text('status', { enum: ['pending', 'accepted', 'rejected', 'withdrawn'] }).default('pending'),
  
  // System timestamps
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

// --- RELATIONS ---
export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  company: one(companies, {
    fields: [applications.companyId],
    references: [companies.id],
  }),
}));

// --- TYPES ---
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;