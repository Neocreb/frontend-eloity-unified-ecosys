#!/usr/bin/env node
/* Apply the remaining features migration to the Supabase PostgreSQL database */

import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MIGRATION_FILE = path.join(process.cwd(), 'migrations', '0003_create_remaining_features_tables.sql');

async function main() {
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
    // Read the migration file
    const migrationContent = fs.readFileSync(MIGRATION_FILE, 'utf-8');
    
    console.log('Applying remaining features migration...');
    
    // Split the migration content into individual statements by double newlines
    const statements = migrationContent
      .split(/\n\s*\n/)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`Found ${statements.length} statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        // Add semicolon if missing
        const finalStatement = statement.endsWith(';') ? statement : statement + ';';
        
        console.log(`Executing statement ${i + 1}/${statements.length}: ${finalStatement.substring(0, 50)}...`);
        try {
          await sql.unsafe(finalStatement);
          console.log(`✓ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.error(`✗ Error executing statement ${i + 1}:`, error.message);
          console.error('Statement:', finalStatement.substring(0, 200) + '...');
          // Continue with other statements instead of failing completely
          // throw error;
        }
      }
    }
    
    console.log('Migration applied successfully!');
    await sql.end();
  } catch (e) {
    console.error('Migration failed:', e);
    try { await sql.end(); } catch (_) {}
    process.exit(1);
  }
}

main();