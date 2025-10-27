const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking foreign key relationships...');

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkForeignKeys() {
  try {
    // Query to get foreign key relationships
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          AND (tc.table_name = 'stories' OR tc.table_name = 'posts')
        ORDER BY tc.table_name, kcu.column_name;
      `
    });
    
    if (error) {
      console.log('❌ Error fetching foreign keys:', error.message);
      return;
    }
    
    console.log('✅ Foreign key relationships query executed');
    if (data && data.result && data.result.rows) {
      console.log('\n📋 Foreign key relationships:');
      data.result.rows.forEach(row => {
        console.log(`  - ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
      });
    } else {
      console.log('  No foreign key relationships found');
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

checkForeignKeys();