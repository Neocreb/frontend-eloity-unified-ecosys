import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

console.log('Testing Supabase connection...');

// Check if environment variables are loaded
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', process.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET');

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.log('❌ Environment variables are missing');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

console.log('✅ Supabase client created successfully');

// Test connection by querying the profiles table
async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Try to get the count of profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Error querying profiles table:', error.message);
      console.log('Error details:', error);
    } else {
      console.log('✅ Database connection successful!');
      console.log('Profiles table accessible');
      console.log('Data:', data);
    }
    
    // Try to search for users
    console.log('Testing user search...');
    const searchQuery = 'test';
    const { data: searchResults, error: searchError } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
      .limit(5);
    
    if (searchError) {
      console.log('❌ Error searching users:', searchError.message);
      console.log('Error details:', searchError);
    } else {
      console.log('✅ User search successful!');
      console.log('Found users:', searchResults.length);
      console.log('Results:', searchResults);
    }
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    console.error('Error details:', error);
  }
}

testConnection();