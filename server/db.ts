import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const { Pool } = pg;
import * as schema from "@shared/schema";

// Use the Render PostgreSQL database URL if provided, otherwise use Replit's DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false // Required for external PostgreSQL connections
  }
});

// Add connection error handling
pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

export const db = drizzle({ client: pool, schema });