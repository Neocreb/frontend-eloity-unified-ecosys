import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking stories table structure...');

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

async function checkStoriesTable() {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    console.log('✅ stories table accessible');
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('📋 Columns:', columns.join(', '));
      
      // Check if user_id column exists
      if (columns.includes('user_id')) {
        console.log('✅ user_id column exists');
      } else {
        console.log('❌ user_id column does not exist');
      }
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

checkStoriesTable();