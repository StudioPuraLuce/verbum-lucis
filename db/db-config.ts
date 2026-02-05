// Load environment variables FIRST
import * as dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL
  || 'postgresql://verbum_user:changeme123@localhost:5432/verbum_lucis';

// Skip database connection during build if DATABASE_URL looks like a test/placeholder
const shouldSkipDb = connectionString.includes('test:test') ||
                     connectionString.includes('localhost') &&
                     process.env.NODE_ENV === 'production';

let client: any;
let db: any;

if (!shouldSkipDb) {
  try {
    client = postgres(connectionString);
    db = drizzle(client, { schema });
  } catch (err) {
    console.warn('⚠️  Database connection failed, continuing in read-only mode');
    // Create a dummy db object to prevent errors
    db = null;
  }
}

export { client, db };
