const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfilesSchema() {
  console.log('🔍 Checking profiles table schema...\n');
  
  try {
    // Try a raw SQL query to get table info
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });
    
    if (error) {
      console.log('❌ Error querying schema:', error.message);
      return;
    }
    
    console.log('📋 Profiles table columns:');
    if (data && data.result && data.result.rows) {
      data.result.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProfilesSchema();