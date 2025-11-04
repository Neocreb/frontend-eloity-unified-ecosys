import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking posts table structure...');

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

async function checkPostsTable() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    console.log('✅ posts table accessible');
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('📋 Columns:', columns.join(', '));
      
      // Check if tagged_users column exists
      if (columns.includes('tagged_users')) {
        console.log('✅ tagged_users column exists');
      } else {
        console.log('❌ tagged_users column does not exist');
      }
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

checkPostsTable();