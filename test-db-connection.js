#!/usr/bin/env node
/* Test database connection */

import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set. Please check your .env file.');
    process.exit(1);
  }

  console.log('Database URL:', dbUrl);

  // Create a postgres client
  const sql = postgres(dbUrl, { 
    ssl: { rejectUnauthorized: false },
    idle_timeout: 5,
    max_lifetime: 30,
    connection_timeout: 5
  });

  try {
    console.log('Testing database connection...');
    // Test the connection with a simple query
    const result = await sql`SELECT version()`;
    console.log('✓ Database connection successful!');
    console.log('Database version:', result[0].version);
    await sql.end();
  } catch (e) {
    console.error('✗ Database connection failed:', e.message);
    try { await sql.end(); } catch (_) {}
    process.exit(1);
  }
}

testConnection();