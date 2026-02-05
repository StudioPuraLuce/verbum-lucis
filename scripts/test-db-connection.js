import * as dotenv from 'dotenv';
dotenv.config();

import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

console.log('Testing connection string:', connectionString);

const sql = postgres(connectionString);

try {
  const result = await sql`SELECT 1 as test`;
  console.log('✅ Connection successful!', result);
  await sql.end();
} catch (error) {
  console.error('❌ Connection failed:', error.message);
  console.error('Code:', error.code);
}
