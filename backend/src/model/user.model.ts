import { pgTable, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- USERS ---

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: text('role', { enum: ['client', 'company'] }).notNull(),
  isVerified: boolean('is_verified').default(false),
  lastLogin: timestamp('last_login', { mode: 'date' }),
  resetPasswordToken: text('reset_password_token'),
  resetPasswordExpiresAt: timestamp('reset_password_expires_at', { mode: 'date' }),
  verificationToken: text('verification_token'),
  verificationExpiresAt: timestamp('verification_expires_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

// --- RELATIONS ---
export const usersRelations = relations(users, ({ one }) => ({
  // Note: Company relation will be imported from companies.schema.ts when needed
  // company: one(companies, {
  //   fields: [users.id],
  //   references: [companies.userId],
  // }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;