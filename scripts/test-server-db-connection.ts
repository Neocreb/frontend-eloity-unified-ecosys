#!/usr/bin/env npx tsx

import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Load environment variables
console.log("🔄 Loading environment variables...");
dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL || 'postgresql://mock:mock@localhost:5432/mock';

console.log("🔍 DATABASE_URL:", databaseUrl);
console.log("");

try {
  console.log("🔄 Attempting to connect to database using server logic...");
  
  // Use postgres-js for Supabase connection with additional connection options
  const client = postgres(databaseUrl, { 
    ssl: {
      rejectUnauthorized: false
    },
    connect_timeout: 20,
    idle_timeout: 30,
    max_lifetime: 60 * 60
  });
  
  const db = drizzle(client);
  
  // Test the connection
  console.log('🔍 Testing database connection...');
  await client`SELECT 1`;
  console.log('✅ Database connection initialized');
  
  // Close the connection
  await client.end();
  console.log('🔒 Database connection closed');
  
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  console.error('🔍 Error details:', error);
}