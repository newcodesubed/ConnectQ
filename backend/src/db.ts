import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as userSchema from './model/user.model';
import * as companiesSchema from './model/companies.model';
import * as clientsSchema from './model/clients.model';
import dotenv from 'dotenv';

dotenv.config();

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
export const db = drizzle(client, { schema: { ...userSchema, ...companiesSchema, ...clientsSchema } });