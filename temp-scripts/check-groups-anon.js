import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔍 Checking groups table with anon key (RLS enabled)...');
console.log('=====================================================');

// Create Supabase client with anon key (like the frontend)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkGroupsTableWithAnonKey() {
  try {
    // Try to select from the groups table with anon key
    const { data, error, count } = await supabase
      .from('groups')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (error) {
      console.log('❌ groups table error with anon key:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ groups table accessible with anon key');
      console.log('Data returned:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('❌ groups table exception with anon key:', err.message);
  }
  
  // Also check group_members table
  console.log('\n🔍 Checking group_members table with anon key...');
  try {
    const { data, error, count } = await supabase
      .from('group_members')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (error) {
      console.log('❌ group_members table error with anon key:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ group_members table accessible with anon key');
      console.log('Data returned:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('❌ group_members table exception with anon key:', err.message);
  }
}

checkGroupsTableWithAnonKey();