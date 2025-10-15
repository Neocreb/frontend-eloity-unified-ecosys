#!/usr/bin/env node
/* Check if the tables were created successfully */

import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkTables() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set. Please check your .env file.');
    process.exit(1);
  }

  // Create a postgres client
  const sql = postgres(dbUrl, { 
    ssl: { rejectUnauthorized: false },
    idle_timeout: 20,
    max_lifetime: 60 * 30
  });

  try {
    console.log('Checking if tables were created...');
    
    // List all tables in the public schema
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('Tables in the database:');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });
    
    // Check if our specific tables exist
    const requiredTables = [
      'sms_templates', 'sms_logs', 'sms_providers',
      'call_sessions', 'call_quality_metrics',
      'kyc_verifications',
      'crypto_orders',
      'notifications', 'notification_preferences',
      'user_analytics',
      'user_stories', 'story_views',
      'community_events', 'event_attendees',
      'challenges',
      'pages',
      'groups'
    ];
    
    console.log('\nChecking for required tables:');
    for (const table of requiredTables) {
      const exists = await sql`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${table}
        )
      `;
      
      if (exists[0].exists) {
        console.log(`✓ ${table} exists`);
      } else {
        console.log(`✗ ${table} does not exist`);
      }
    }
    
    await sql.end();
  } catch (e) {
    console.error('Error checking tables:', e);
    try { await sql.end(); } catch (_) {}
    process.exit(1);
  }
}

checkTables();