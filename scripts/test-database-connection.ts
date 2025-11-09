#!/usr/bin/env npx tsx

import { config } from "dotenv";
import postgres from 'postgres';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function testDatabaseConnection() {
  console.log("🚀 Testing database connection\n");

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("🔍 DATABASE_URL:", databaseUrl);
  console.log("");

  try {
    console.log("🔄 Attempting to connect to database...");
    
    // Use postgres-js for Supabase connection with additional connection options
    const client = postgres(databaseUrl, { 
      ssl: {
        rejectUnauthorized: false
      },
      connect_timeout: 20,
      idle_timeout: 30,
      max_lifetime: 60 * 60
    });
    
    // Test the connection
    console.log("🔍 Testing connection...");
    await client`SELECT 1`;
    console.log("✅ Database connection successful!");
    
    // Try a simple query
    console.log("🔍 Testing simple query...");
    const result = await client`SELECT version()`;
    console.log("✅ Simple query successful!");
    console.log("   Database version:", result[0].version);
    
    // Close the connection
    await client.end();
    console.log("🔒 Database connection closed");
    
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("🔍 Error details:", error);
    process.exit(1);
  }
}

testDatabaseConnection().catch(console.error);