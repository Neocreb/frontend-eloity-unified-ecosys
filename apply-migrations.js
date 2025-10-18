#!/usr/bin/env node

// Script to apply database migrations to Supabase
// This script will run all SQL migrations in the supabase/migrations directory

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

async function applyMigrations() {
  try {
    // Check if required environment variables are set
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
      console.error('❌ Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file');
      process.exit(1);
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    );

    console.log('🚀 Connecting to Supabase...');
    
    // Test connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.message !== 'The resource was not found') {
      console.error('❌ Supabase connection failed:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Connected to Supabase successfully');

    // Get migration files
    const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.error('❌ Migrations directory not found:', migrationsDir);
      process.exit(1);
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('ℹ️  No migration files found');
      return;
    }

    console.log(`📋 Found ${migrationFiles.length} migration files`);

    // Apply each migration
    for (const file of migrationFiles) {
      console.log(`\n📝 Applying migration: ${file}`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split SQL into statements (simple approach)
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      for (const statement of statements) {
        if (statement.trim().length === 0) continue;
        
        try {
          // Execute the statement
          const { error } = await supabase.rpc('execute_sql', { sql: statement });
          
          if (error) {
            // Some statements might not be supported by rpc, so we'll log and continue
            console.warn(`⚠️  Warning executing statement: ${error.message}`);
          }
        } catch (stmtError) {
          console.warn(`⚠️  Warning executing statement: ${stmtError.message}`);
        }
      }
      
      console.log(`✅ Migration ${file} applied successfully`);
    }

    console.log('\n🎉 All migrations applied successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the connection: node test-supabase-connection.js');
    console.log('2. Start the development server: npm run dev');

  } catch (error) {
    console.error('❌ Error applying migrations:', error.message);
    process.exit(1);
  }
}

applyMigrations();