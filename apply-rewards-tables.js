#!/usr/bin/env node
/* Apply rewards tables directly */

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyRewardsTables() {
  try {
    console.log('Applying rewards tables...');
    
    // Read the SQL file
    const sql = fs.readFileSync('create-rewards-tables-direct.sql', 'utf8');
    
    // Split into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement.length === 0) continue;
      
      console.log('Executing statement:', trimmedStatement.substring(0, 50) + '...');
      
      // Execute each statement
      const { error } = await supabase.rpc('execute_sql', { sql: trimmedStatement });
      
      if (error) {
        console.error('Error executing statement:', error);
      } else {
        console.log('Statement executed successfully');
      }
    }
    
    console.log('Rewards tables applied successfully!');
  } catch (error) {
    console.error('Error applying rewards tables:', error);
  }
}

applyRewardsTables();