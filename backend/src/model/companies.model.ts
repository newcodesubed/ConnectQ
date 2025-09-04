import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user.model';

// --- COMPANIES ---

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  description: text('description'),
  industry: text('industry'),
  location: text('location'),
  contactNumber: text('contact_number'),
  imgPath: text('img_path'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// --- RELATIONS ---
export const companiesRelations = relations(companies, ({ one }) => ({
  owner: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
}));

// --- TYPES ---
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
