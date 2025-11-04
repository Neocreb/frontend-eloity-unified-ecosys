// Test if execute_sql function exists
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testExecuteSqlFunction() {
  console.log('🔍 Testing if execute_sql function exists...');
  
  try {
    // Try to call the execute_sql function
    const { data, error } = await supabase.rpc('execute_sql', { sql: 'SELECT 1' });
    
    if (error) {
      console.log('❌ execute_sql function does not exist or is not accessible');
      console.log('Error:', error.message);
      
      // Try to list available RPC functions
      console.log('\n🔍 Listing available RPC functions...');
      const { data: functions, error: functionsError } = await supabase
        .from('pg_proc')
        .select('proname')
        .ilike('proname', '%sql%');
      
      if (functionsError) {
        console.log('Error listing functions:', functionsError.message);
      } else {
        console.log('Functions with "sql" in name:', functions);
      }
    } else {
      console.log('✅ execute_sql function exists and is accessible');
      console.log('Data:', data);
    }
  } catch (error) {
    console.error('❌ Error testing execute_sql function:', error.message);
  }
}

testExecuteSqlFunction();