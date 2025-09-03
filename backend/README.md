# Migrating from Raw SQL to Drizzle ORM

This guide provides step-by-step instructions to migrate your existing Node.js/TypeScript backend from raw SQL queries using `pg` to Drizzle ORM.

## Current Setup Overview

Your codebase currently uses:
- **Database**: PostgreSQL via `pg` library
- **Connection**: Pool-based connection in `src/db.ts`
- **Queries**: Raw SQL strings in `src/models/user.model.ts`
- **Operations**: User authentication (signup, login, password reset, email verification)

## Prerequisites

- Node.js and npm installed
- PostgreSQL database running
- Existing database schema for `users` table

## Step 1: Install Drizzle Dependencies

Install the required packages:

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

## Step 2: Create Drizzle Configuration

Create a `drizzle.config.ts` file in the root directory:

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## Step 3: Define Database Schema

Create the schema file `src/db/schema.ts`:

```typescript
import { pgTable, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';

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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

## Step 4: Update Database Connection

Replace `src/db.ts` with Drizzle setup:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

## Step 5: Migrate User Model

Update `src/models/user.model.ts` to use Drizzle:

```typescript
import { db } from '../db/db';
import { users } from '../db/schema';
import { eq, and, gt } from 'drizzle-orm';

export const UserModel = {
  async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  },

  async create(userData: {
    email: string;
    password: string;
    name: string;
    role: 'client' | 'company';
    verificationToken?: string;
    verificationExpiresAt?: Date;
  }) {
    const result = await db.insert(users).values({
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: userData.role,
      verificationToken: userData.verificationToken,
      verificationExpiresAt: userData.verificationExpiresAt,
    }).returning();
    return result[0];
  },

  async verifyUser(token: string) {
    const result = await db
      .update(users)
      .set({
        isVerified: true,
        verificationToken: null,
        verificationExpiresAt: null,
      })
      .where(
        and(
          eq(users.verificationToken, token),
          gt(users.verificationExpiresAt, new Date())
        )
      )
      .returning();
    return result[0] || null;
  },

  async updateLastLogin(userId: string) {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, userId));
  },

  async setResetToken(userId: string, token: string, expiresAt: Date) {
    await db
      .update(users)
      .set({
        resetPasswordToken: token,
        resetPasswordExpiresAt: expiresAt,
      })
      .where(eq(users.id, userId));
  },

  async findByResetToken(token: string) {
    const result = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetPasswordToken, token),
          gt(users.resetPasswordExpiresAt, new Date())
        )
      );
    return result[0] || null;
  },

  async updatePassword(userId: string, newPassword: string) {
    await db
      .update(users)
      .set({
        password: newPassword,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
      })
      .where(eq(users.id, userId));
  },

  async findById(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  },
};
```

## Step 6: Update Main Application File

In `src/index.ts`, update the database connection:

```typescript
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import { db } from './db/db'; // Update import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (_, res) => res.send('Server is running'));
app.use('/api/auth', authRoutes);

app.listen(PORT, async () => {
  // Remove pool.connect() as Drizzle handles connection
  console.log(`Server running on port ${PORT}`);
});
```

## Step 7: Update Package.json Scripts

Add Drizzle commands to `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## Step 8: Generate and Run Migrations (Optional)

If you want to use Drizzle's migration system:

```bash
npm run db:generate
npm run db:migrate
```

Alternatively, push schema changes directly:

```bash
npm run db:push
```

## Step 9: Update Type Definitions

Update the User interface in `src/models/user.model.ts` to match Drizzle types:

```typescript
import { User } from '../db/schema'; // Use Drizzle's inferred type

export { User }; // Export the Drizzle type
```

## Step 10: Test the Migration

1. Start your server: `npm run dev`
2. Test all authentication endpoints:
   - Signup
   - Login
   - Email verification
   - Password reset
   - Check auth

## Benefits of Drizzle ORM

- **Type Safety**: Full TypeScript integration
- **SQL-like Syntax**: Familiar query building
- **Migrations**: Built-in migration system
- **Performance**: Optimized queries
- **Developer Experience**: Better IntelliSense and error checking

## Troubleshooting

- **Connection Issues**: Ensure `DATABASE_URL` is correct
- **Type Errors**: Update imports to use Drizzle's inferred types
- **Query Errors**: Check Drizzle documentation for correct syntax
- **Migration Conflicts**: Backup database before running migrations

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL Driver](https://orm.drizzle.team/docs/connect-overview)</content>
<parameter name="filePath">/home/subed/Documents/final_project/backend/README.md
