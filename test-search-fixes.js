// Test script to verify the search fixes
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Test the search functionality directly with Supabase
import { createClient } from '@supabase/supabase-js';

async function testSearchFixes() {
  console.log('Testing search fixes...');
  
  try {
    // Create Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    );
    
    // Test the exact query used in UserService.searchUsers
    console.log('Testing search query similar to UserService...');
    const query = 'test';
    const limit = 20;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      console.error('Error searching users:', error);
      return;
    }

    console.log('Search results:', data.length);
    console.log('Results:', data);
    
    // Test with another query
    console.log('\nTesting with "user" query...');
    const { data: userResults, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%user%,full_name.ilike.%user%,email.ilike.%user%`)
      .limit(limit);

    if (userError) {
      console.error('Error searching users with "user":', userError);
      return;
    }

    console.log('"user" query results:', userResults.length);
    console.log('"user" results:', userResults);
    
  } catch (error) {
    console.error('Error testing search fixes:', error);
    console.error('Error details:', error.message);
  }
}

testSearchFixes();