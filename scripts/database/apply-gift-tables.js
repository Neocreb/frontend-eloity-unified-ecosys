#!/usr/bin/env node
/* Apply missing gift tables */

import fs from 'fs';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate environment variables
const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('Missing database URL. Please check your environment variables.');
  console.error('Required: SUPABASE_DB_URL or DATABASE_URL');
  process.exit(1);
}

async function applyGiftTables() {
  const sql = postgres(dbUrl, { ssl: { rejectUnauthorized: false } });
  
  try {
    console.log('Applying gift tables...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('create-missing-gift-tables.sql', 'utf8');
    
    // Split into individual statements
    const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const [index, statement] of statements.entries()) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement.length === 0) continue;
      
      console.log(`Executing statement ${index + 1}/${statements.length}:`, trimmedStatement.substring(0, 50) + '...');
      
      try {
        await sql.unsafe(trimmedStatement);
        console.log('Statement executed successfully');
      } catch (error) {
        // Check if it's a benign error (like duplicate table)
        if (error.code === '42P07' || (error.message && error.message.includes('already exists'))) {
          console.log('Skipped duplicate table/index');
        } else {
          console.error('Error executing statement:', error.message);
        }
      }
    }
    
    console.log('Gift tables applied successfully!');
    await sql.end();
  } catch (error) {
    console.error('Error applying gift tables:', error);
    try { await sql.end(); } catch (_) {}
    process.exit(1);
  }
}

applyGiftTables();