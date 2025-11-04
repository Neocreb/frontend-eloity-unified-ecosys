import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking groups table...');
console.log('==========================');

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

async function checkGroupsTable() {
  try {
    // Try to select from the groups table
    const { data, error, count } = await supabase
      .from('groups')
      .select('id', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.log('❌ groups table error:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ groups table accessible');
      console.log('Row count:', count);
    }
  } catch (err) {
    console.log('❌ groups table exception:', err.message);
  }
  
  // Also check group_members table
  console.log('\n🔍 Checking group_members table...');
  try {
    const { data, error, count } = await supabase
      .from('group_members')
      .select('id', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.log('❌ group_members table error:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ group_members table accessible');
      console.log('Row count:', count);
    }
  } catch (err) {
    console.log('❌ group_members table exception:', err.message);
  }
}

checkGroupsTable();