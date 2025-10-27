import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

// List of tables to check
const tablesToCheck = [
  'admin_activity_logs',
  'admin_users',
  'admin_permissions',
  'notifications',
  'posts',
  'products',
  'marketplace_orders',
  'freelance_jobs',
  'p2p_offers',
  'wallets',
  'groups',
  'chat_threads',
  'system_settings'
];

async function checkTableColumns() {
  console.log('🔍 Checking table columns...');
  
  for (const table of tablesToCheck) {
    try {
      // Get table info
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Error checking ${table}: ${error.message}`);
        continue;
      }
      
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        console.log(`✅ ${table}: ${columns.join(', ')}`);
      } else {
        // Try to get column info for empty tables
        const { data: columnData, error: columnError } = await supabase
          .from(table)
          .select('*, abc123xyz') // Invalid column to force error with column info
          .limit(1);
          
        if (columnError) {
          // Extract column names from error message
          const columnMatch = columnError.message.match(/column "([^"]+)" does not exist/g);
          if (columnMatch) {
            console.log(`✅ ${table}: ${columnMatch.map(m => m.replace('column "', '').replace('" does not exist', '')).join(', ')}`);
          } else {
            console.log(`✅ ${table}: (empty table, couldn't determine columns)`);
          }
        }
      }
    } catch (err) {
      console.log(`❌ Error checking ${table}: ${err.message}`);
    }
  }
}

checkTableColumns();