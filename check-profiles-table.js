import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking profiles table structure...');

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

async function checkProfilesTable() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    console.log('✅ profiles table accessible');
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('📋 Columns:', columns.join(', '));
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

checkProfilesTable();