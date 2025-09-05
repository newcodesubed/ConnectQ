import { pgTable, text, timestamp, uuid,integer } from 'drizzle-orm/pg-core';
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
  // Branding
  logoUrl: text("logo_url"),
  website: text("website"),
  tagline: text("tagline"),
  foundedAt: timestamp("founded_at", { mode: "date" }),

  // Offerings
  services: text("services").array(),          // array of strings
  technologiesUsed: text("technologies_used").array(),
  costRange: text("cost_range"),               // e.g. "$5k–$50k"
  deliveryDuration: text("delivery_duration"), // e.g. "2–6 weeks"
  specializations: text("specializations").array(),

  // Scale
  employeeCount: integer("employee_count"),

  // Reputation
  reviews: text("reviews").array(),            // simple array (could normalize later)

  // Social Links
  linkedinUrl: text("linkedin_url"),
  twitterUrl: text("twitter_url"),

  // System
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
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
