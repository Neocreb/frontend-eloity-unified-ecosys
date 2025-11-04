import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking actual database tables...');
console.log('====================================');

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

async function listTables() {
  console.log('\n🔍 Testing database connection and checking specific tables...');
  
  // List of tables that might be causing issues
  const tablesToCheck = [
    'users', 'profiles', 'posts', 'stories', 'products', 'notifications',
    'live_streams', 'battles', 'admin_users', 'admin_activity_logs'
  ];
  
  for (const tableName of tablesToCheck) {
    try {
      // Try to select from the table with a simple query
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: Table exists and is accessible`);
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ${err.message}`);
    }
  }
  
  // Check table structure for posts table
  console.log('\n🔍 Checking posts table structure...');
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ posts table structure issue:', error.message);
    } else {
      console.log('✅ posts table accessible');
      if (data && data.length > 0) {
        console.log('   Sample columns:', Object.keys(data[0]).slice(0, 5).join(', '));
      }
    }
  } catch (err) {
    console.log('❌ posts table error:', err.message);
  }
  
  // Check table structure for stories table
  console.log('\n🔍 Checking stories table structure...');
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ stories table structure issue:', error.message);
    } else {
      console.log('✅ stories table accessible');
      if (data && data.length > 0) {
        console.log('   Sample columns:', Object.keys(data[0]).slice(0, 5).join(', '));
      }
    }
  } catch (err) {
    console.log('❌ stories table error:', err.message);
  }
  
  // Check if live_streams table exists
  console.log('\n🔍 Checking live_streams table...');
  try {
    const { data, error } = await supabase
      .from('live_streams')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ live_streams table issue:', error.message);
    } else {
      console.log('✅ live_streams table accessible');
    }
  } catch (err) {
    console.log('❌ live_streams table error:', err.message);
  }
  
  // Check if battles table exists
  console.log('\n🔍 Checking battles table...');
  try {
    const { data, error } = await supabase
      .from('battles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ battles table issue:', error.message);
    } else {
      console.log('✅ battles table accessible');
    }
  } catch (err) {
    console.log('❌ battles table error:', err.message);
  }
}

listTables();