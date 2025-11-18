#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    const migrationPath = path.join(process.cwd(), 'migrations', '0022_fix_post_comments_rls_policies.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Applying post_comments RLS policy fix...');
    
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('Error applying migration:', error);
      process.exit(1);
    }

    console.log('✓ Successfully applied post_comments RLS policy fix');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

applyMigration();
