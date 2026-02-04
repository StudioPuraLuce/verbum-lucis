// Load environment variables FIRST
import * as dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL
  || 'postgresql://verbum_user:changeme123@localhost:5432/verbum_lucis';

export const client = postgres(connectionString);
export const db = drizzle(client, { schema });
