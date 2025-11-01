#!/usr/bin/env node
/* Apply sample gift data */

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

async function applySampleGiftData() {
  const sql = postgres(dbUrl, { ssl: { rejectUnauthorized: false } });
  
  try {
    console.log('Applying sample gift data...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('insert-sample-gift-data.sql', 'utf8');
    
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
        // Check if it's a benign error (like duplicate data)
        if (error.code === '23505' || (error.message && error.message.includes('duplicate key'))) {
          console.log('Skipped duplicate data');
        } else {
          console.error('Error executing statement:', error.message);
        }
      }
    }
    
    console.log('Sample gift data applied successfully!');
    await sql.end();
  } catch (error) {
    console.error('Error applying sample gift data:', error);
    try { await sql.end(); } catch (_) {}
    process.exit(1);
  }
}

applySampleGiftData();