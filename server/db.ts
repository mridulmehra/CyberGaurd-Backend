import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon database WebSocket
neonConfig.webSocketConstructor = ws;

// Track whether we're using the database or not
export let usingDatabase = false;

// Set up database connection if DATABASE_URL is available
let pool: Pool | null = null;
let db: any = null;

try {
  if (process.env.DATABASE_URL) {
    console.log("Database URL found, attempting to connect to PostgreSQL database...");
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
    usingDatabase = true;
    console.log("Successfully connected to PostgreSQL database");
  } else {
    console.log("No DATABASE_URL found, database features will be disabled");
    usingDatabase = false;
  }
} catch (error) {
  console.error("Failed to connect to database:", error);
  console.log("Database connection failed, falling back to in-memory storage");
  usingDatabase = false;
}

export { pool, db };