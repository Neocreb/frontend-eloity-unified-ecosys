import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = join(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

// Create Supabase client with service role key for admin access
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Found' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyFix() {
  try {
    console.log('Applying chat_messages to profiles relationship fix...');
    
    // Since we can't use RPC to execute raw SQL, let's try to create the view using the Supabase client
    // We'll need to use a different approach since execute_sql RPC doesn't exist
    
    // First, let's check if we can access the tables
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id')
      .limit(1);
    
    if (profilesError) {
      console.error('Error accessing profiles table:', profilesError);
    } else {
      console.log('Successfully accessed profiles table');
    }
    
    const { data: messagesData, error: messagesError } = await supabase
      .from('chat_messages')
      .select('id, sender_id')
      .limit(1);
    
    if (messagesError) {
      console.error('Error accessing chat_messages table:', messagesError);
    } else {
      console.log('Successfully accessed chat_messages table');
    }
    
    // Since we can't directly execute raw SQL through the JS client,
    // let's create a migration file that can be applied manually
    console.log('\nCreating migration file for manual application...');
    
    const fs = await import('fs');
    const path = await import('path');
    
    const migrationContent = `-- Migration: Fix chat_messages to profiles relationship
-- This migration creates a view that joins chat_messages with profiles tables
-- to enable proper JOIN operations in PostgREST

-- Create a view that joins chat_messages with profiles
CREATE OR REPLACE VIEW public.chat_messages_with_profiles AS
SELECT 
    cm.*,
    p.id as profile_id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.is_verified,
    p.level,
    p.points,
    p.role
FROM public.chat_messages cm
LEFT JOIN public.profiles p ON cm.sender_id = p.user_id;

-- Grant necessary permissions
GRANT ALL ON public.chat_messages_with_profiles TO authenticated;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';`;

    const migrationPath = path.join(__dirname, '..', 'migrations', '0023_fix_chat_messages_profiles_relationship.sql');
    fs.writeFileSync(migrationPath, migrationContent);
    
    console.log('Migration file created at:', migrationPath);
    console.log('Please apply this migration manually using:');
    console.log('npx supabase db push --include-all');
    console.log('or');
    console.log('npx supabase migration up');
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

applyFix();