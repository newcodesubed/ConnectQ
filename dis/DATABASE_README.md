# ConnectQ Database Documentation

## 🗄️ Complete Database Architecture & Schema Reference

This document provides comprehensive documentation of the ConnectQ database system, including ORM setup, schema design, relationships, and migration history.

---

## 📋 Table of Contents

1. [Database Technology Stack](#database-technology-stack)
2. [Database Architecture](#database-architecture)
3. [Schema Overview](#schema-overview)
4. [Table Specifications](#table-specifications)
5. [Relationships & Foreign Keys](#relationships--foreign-keys)
6. [Migration History](#migration-history)
7. [ORM Configuration](#orm-configuration)
8. [Data Types & Constraints](#data-types--constraints)
9. [Indexes & Performance](#indexes--performance)
10. [Development Workflow](#development-workflow)

---

## 🛠️ Database Technology Stack

### Core Technologies
- **Database**: PostgreSQL 16+
- **ORM**: Drizzle ORM 0.44.5
- **Migration Tool**: Drizzle Kit 0.31.4
- **Connection Library**: postgres.js 3.4.7
- **Language**: TypeScript

### Key Features
- **Type Safety**: Full TypeScript integration with inferred types
- **Schema-First**: Code-first database design
- **Auto-Generated Migrations**: Automatic SQL migration generation
- **Relationship Management**: Declarative foreign key relationships
- **Performance**: Optimized queries with prepared statements

---

## 🏗️ Database Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ConnectQ Database                            │
├─────────────────┬─────────────────┬─────────────────┬───────────┤
│      Core       │    Profiles     │   Interactions  │   Jobs    │
│   (Identity)    │  (Business)     │   (Matching)    │ (Projects)│
├─────────────────┼─────────────────┼─────────────────┼───────────┤
│ • users         │ • companies     │ • interests     │ • jobs    │
│ • auth tokens   │ • clients       │ • notifications │ • apps    │
│ • sessions      │ • profiles      │ • communications│ • bids    │
│ • roles         │ • capabilities  │ • status mgmt   │ • tracking│
└─────────────────┴─────────────────┴─────────────────┴───────────┘
```

### Database Connection Flow
```typescript
Environment Variables → postgres.js Client → Drizzle ORM → Application
```

---

## 📊 Schema Overview

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ COMPANIES : "owns"
    USERS ||--o{ CLIENTS : "owns"
    CLIENTS ||--o{ JOBS : "posts"
    COMPANIES ||--o{ APPLICATIONS : "submits"
    JOBS ||--o{ APPLICATIONS : "receives"
    CLIENTS ||--o{ INTERESTS : "receives"
    COMPANIES ||--o{ INTERESTS : "expresses"
    
    USERS {
        uuid id PK
        text email UK
        text password
        text name
        enum role
        boolean isVerified
        timestamp lastLogin
        text resetPasswordToken
        timestamp resetPasswordExpiresAt
        text verificationToken
        timestamp verificationExpiresAt
        timestamp createdAt
        timestamp updatedAt
    }
    
    COMPANIES {
        uuid id PK
        uuid userId FK
        text name
        text email
        text description
        text industry
        text location
        text contactNumber
        text logoUrl
        text website
        text tagline
        timestamp foundedAt
        text_array services
        text_array technologiesUsed
        text costRange
        text deliveryDuration
        text_array specializations
        integer employeeCount
        text_array reviews
        text linkedinUrl
        text twitterUrl
        timestamp createdAt
    }
    
    CLIENTS {
        uuid id PK
        uuid userId FK
        text name
        text email
        text imageUrl
        text profilePicUrl
        text contactNumber
        text bio
        text description
        enum status
        timestamp createdAt
        timestamp updatedAt
    }
    
    JOBS {
        uuid id PK
        uuid clientId FK
        text title
        text description
        text requirements
        text budget
        text timeline
        enum status
        timestamp createdAt
        timestamp updatedAt
    }
    
    APPLICATIONS {
        uuid id PK
        uuid jobId FK
        uuid companyId FK
        text message
        enum status
        timestamp createdAt
        timestamp updatedAt
    }
    
    INTERESTS {
        uuid id PK
        uuid clientId FK
        uuid companyId FK
        text message
        enum status
        boolean isRead
        timestamp createdAt
        timestamp updatedAt
    }
```

---

## 📋 Table Specifications

### 1. **users** (Core Authentication)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'company')),
  is_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  reset_password_token TEXT,
  reset_password_expires_at TIMESTAMP,
  verification_token TEXT,
  verification_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Central user authentication and authorization
**Key Features**:
- UUID primary keys for security
- Role-based access control (client/company)
- Email verification system
- Password reset functionality
- Audit trails with timestamps

### 2. **companies** (Service Providers)
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  location TEXT,
  contact_number TEXT,
  
  -- Branding
  logo_url TEXT,
  website TEXT,
  tagline TEXT,
  founded_at TIMESTAMP,
  
  -- Offerings  
  services TEXT[],
  technologies_used TEXT[],
  cost_range TEXT,
  delivery_duration TEXT,
  specializations TEXT[],
  
  -- Scale
  employee_count INTEGER,
  
  -- Reputation
  reviews TEXT[],
  
  -- Social Links
  linkedin_url TEXT,
  twitter_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Comprehensive company profiles for service providers
**Key Features**:
- Rich profile data with branding elements
- Array fields for services and technologies
- Social media integration
- Scalability indicators
- SEO-friendly structure

### 3. **clients** (Service Seekers)
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  image_url TEXT,
  profile_pic_url TEXT,
  contact_number TEXT,
  bio TEXT,
  description TEXT,
  status TEXT CHECK (status IN ('open', 'matched', 'closed')) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Client profiles with project requirements
**Key Features**:
- Flexible profile structure
- Project status management
- Legacy field support (profile_pic_url)
- Natural language requirements

### 4. **jobs** (Project Postings)
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  budget TEXT,
  timeline TEXT,
  status TEXT CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Structured job postings by clients
**Key Features**:
- Detailed project specifications
- Budget and timeline tracking
- Status lifecycle management
- Cascading deletes

### 5. **applications** (Job Applications)
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Company applications to specific job postings
**Key Features**:
- Many-to-many relationship (jobs ↔ companies)
- Application status tracking
- Optional cover letter/message
- Audit trail

### 6. **interests** (Interest Expressions)
```sql
CREATE TABLE interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Simple interest tracking between companies and clients
**Key Features**:
- Direct company-to-client interest expression
- Notification system support
- Status management
- Read/unread tracking

---

## 🔗 Relationships & Foreign Keys

### Relationship Hierarchy

```
users (1) ──→ (0..1) companies
users (1) ──→ (0..1) clients
clients (1) ──→ (0..*) jobs
jobs (1) ──→ (0..*) applications
companies (1) ──→ (0..*) applications
clients (1) ──→ (0..*) interests
companies (1) ──→ (0..*) interests
```

### Foreign Key Constraints

#### **CASCADE DELETE Behavior**
```sql
-- User deletion cascades to their profiles
companies.user_id → users.id (ON DELETE CASCADE)
clients.user_id → users.id (ON DELETE CASCADE)

-- Client deletion cascades to their jobs and interests
jobs.client_id → clients.id (ON DELETE CASCADE)
interests.client_id → clients.id (ON DELETE CASCADE)

-- Company deletion cascades to their applications and interests
applications.company_id → companies.id (ON DELETE CASCADE)
interests.company_id → companies.id (ON DELETE CASCADE)

-- Job deletion cascades to applications
applications.job_id → jobs.id (ON DELETE CASCADE)
```

### Relationship Definitions (Drizzle ORM)

#### **Users Relations**
```typescript
export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.id],
    references: [companies.userId],
  }),
  client: one(clients, {
    fields: [users.id], 
    references: [clients.userId],
  }),
}));
```

#### **Companies Relations**
```typescript
export const companiesRelations = relations(companies, ({ one, many }) => ({
  owner: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
  applications: many(applications),
  interests: many(interests),
}));
```

#### **Clients Relations**
```typescript
export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  jobs: many(jobs),
  interests: many(interests),
}));
```

---

## 📝 Migration History

### Migration Timeline

| Migration | File | Changes | Purpose |
|-----------|------|---------|---------|
| 0000 | `mute_ironclad.sql` | Initial users, companies tables | Foundation setup |
| 0001 | `fat_nick_fury.sql` | Added clients table | Client profile system |
| 0002 | `complex_phalanx.sql` | Company schema updates | Enhanced company profiles |
| 0003 | `conscious_the_initiative.sql` | Extended company fields | Branding & social features |
| 0004 | `round_selene.sql` | Added jobs, applications | Job posting system |
| 0004 | `worried_garia.sql` | Added interests table | Interest tracking system |

### Key Schema Evolution

#### **Phase 1: Foundation (Migration 0000)**
- Basic user authentication system
- Initial company profiles
- Core foreign key relationships

#### **Phase 2: Client System (Migration 0001)**
- Added client profiles
- Project description system
- Status management

#### **Phase 3: Enhanced Profiles (Migrations 0002-0003)**
- Rich company profile data
- Array fields for services/technologies
- Social media integration
- Branding elements

#### **Phase 4: Job System (Migration 0004)**
- Structured job postings
- Application tracking system
- Status lifecycle management

#### **Phase 5: Interest System (Migration 0004-b)**
- Direct interest expressions
- Notification support
- Read/unread tracking

---

## ⚙️ ORM Configuration

### Drizzle Setup (`drizzle.config.ts`)
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: [
    './src/model/user.model.ts',
    './src/model/companies.model.ts', 
    './src/model/clients.model.ts',
    './src/model/jobs.model.ts',
    './src/model/applications.model.ts',
    './src/model/interests.model.ts'
  ],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Database Connection (`db.ts`)
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
export const db = drizzle(client, { 
  schema: { 
    ...userSchema, 
    ...companiesSchema, 
    ...clientsSchema,
    ...jobsSchema,
    ...applicationsSchema,
    ...interestsSchema
  } 
});
```

### Type Generation
```typescript
// Automatic type inference from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
// ... etc for all models
```

---

## 🔧 Data Types & Constraints

### Standard Data Types

#### **UUID Fields**
```typescript
id: uuid('id').primaryKey().defaultRandom()
userId: uuid('user_id').notNull().references(() => users.id)
```
- **Purpose**: Secure, non-sequential primary keys
- **Benefits**: No enumeration attacks, distributed system friendly

#### **Text Fields**
```typescript
email: text('email').notNull().unique()
description: text('description')
```
- **Purpose**: Variable-length string data
- **Constraints**: NOT NULL, UNIQUE where applicable

#### **Array Fields**
```typescript
services: text("services").array()
technologiesUsed: text("technologies_used").array()
```
- **Purpose**: Multiple related values in single field
- **Benefits**: Simplifies queries, reduces normalization

#### **Enum Fields**
```typescript
role: text('role', { enum: ['client', 'company'] }).notNull()
status: text('status', { enum: ['open', 'matched', 'closed'] }).default('open')
```
- **Purpose**: Controlled vocabulary, data integrity
- **Validation**: Database-level constraints

#### **Timestamp Fields**
```typescript
createdAt: timestamp('created_at', { mode: 'date' }).defaultNow()
updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow()
```
- **Purpose**: Audit trails, temporal data
- **Mode**: Date objects for TypeScript compatibility

### Business Logic Constraints

#### **User Role Validation**
- Only 'client' or 'company' roles allowed
- One-to-one relationship with profile tables
- Role determines access permissions

#### **Status Workflows**
```typescript
// Client project status
'open' → 'matched' → 'closed'

// Job status
'open' → 'in_progress' → 'completed'/'cancelled'

// Application status  
'pending' → 'accepted'/'rejected'/'withdrawn'

// Interest status
'pending' → 'accepted'/'rejected'
```

---

## 📈 Indexes & Performance

### Recommended Indexes

#### **Primary Access Patterns**
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_verification_token ON users(verification_token);
CREATE INDEX idx_users_reset_token ON users(reset_password_token);

-- Profile relationships
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_clients_user_id ON clients(user_id);

-- Job system
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_company_id ON applications(company_id);

-- Interest system
CREATE INDEX idx_interests_client_id ON interests(client_id);
CREATE INDEX idx_interests_company_id ON interests(company_id);
CREATE INDEX idx_interests_unread ON interests(client_id, is_read);
```

#### **Composite Indexes**
```sql
-- Prevent duplicate interests
CREATE UNIQUE INDEX idx_interests_unique ON interests(client_id, company_id);

-- Performance for status queries
CREATE INDEX idx_clients_status ON clients(status, created_at);
CREATE INDEX idx_jobs_status_created ON jobs(status, created_at);
```

### Query Optimization

#### **Common Query Patterns**
```typescript
// Optimized user profile lookup
const user = await db.select()
  .from(users)
  .where(eq(users.email, email))
  .limit(1);

// Efficient interest counting
const unreadCount = await db.select({ count: count() })
  .from(interests)
  .where(and(
    eq(interests.clientId, clientId),
    eq(interests.isRead, false)
  ));

// Join optimization
const jobsWithApplications = await db.select()
  .from(jobs)
  .leftJoin(applications, eq(jobs.id, applications.jobId))
  .where(eq(jobs.clientId, clientId));
```

---

## 🔄 Development Workflow

### Database Commands

#### **Schema Management**
```bash
# Generate migration from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate  

# Push schema directly (development only)
npm run db:push
```

#### **Migration Workflow**
1. Modify schema files (`*.model.ts`)
2. Generate migration: `npm run db:generate`
3. Review generated SQL in `/drizzle`
4. Apply migration: `npm run db:migrate`
5. Commit schema changes and migration files

### Environment Setup

#### **Required Environment Variables**
```env
# PostgreSQL connection
DATABASE_URL=postgresql://username:password@host:port/database

# Development vs Production
NODE_ENV=development|production
```

#### **Local Development**
```bash
# Install dependencies
npm install

# Setup database
npm run db:migrate

# Start development server
npm run dev
```

### Schema Design Principles

#### **Normalization Strategy**
- **Normalized**: Core entities (users, companies, clients)
- **Denormalized**: Arrays for related data (services, technologies)
- **Hybrid**: Balance between performance and maintainability

#### **Relationship Design**
- **One-to-One**: User ↔ Company/Client profiles
- **One-to-Many**: Client ↔ Jobs, Company ↔ Applications
- **Many-to-Many**: Through junction tables (applications, interests)

#### **Data Integrity**
- Foreign key constraints with CASCADE DELETE
- Enum constraints for controlled vocabularies
- Unique constraints for business rules
- NOT NULL constraints for required data

---

## 📊 Database Statistics

### Table Sizes (Estimated)

| Table | Estimated Rows | Primary Use Case |
|-------|----------------|------------------|
| users | 10K - 100K | Authentication |
| companies | 1K - 10K | Service providers |
| clients | 5K - 50K | Service seekers |
| jobs | 10K - 100K | Project postings |
| applications | 50K - 500K | Job applications |
| interests | 20K - 200K | Interest tracking |

### Growth Patterns
- **Users**: Linear growth with signups
- **Jobs**: Cyclical, business-driven
- **Applications**: High volume, many-to-many
- **Interests**: Moderate volume, notification-driven

---

This database architecture provides a solid foundation for the ConnectQ platform, with careful consideration for scalability, performance, and maintainability. The schema design supports the core business logic while remaining flexible enough for future enhancements.