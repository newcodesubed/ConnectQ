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