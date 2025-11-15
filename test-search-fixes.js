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
    
    // Sanitize query to prevent complex parsing issues
    const sanitizedQuery = query.trim().replace(/[^a-zA-Z0-9_\-.\s@]/g, '');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${sanitizedQuery}%,full_name.ilike.%${sanitizedQuery}%`)
      .limit(limit);

    if (error) {
      console.error('Error searching users:', error);
      return;
    }

    console.log('Search results:', data.length);
    console.log('Results:', data);
    
    // Test with another query
    console.log('\nTesting with "user" query...');
    const userQuery = 'user';
    const sanitizedUserQuery = userQuery.trim().replace(/[^a-zA-Z0-9_\-.\s@]/g, '');
    
    const { data: userResults, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${sanitizedUserQuery}%,full_name.ilike.%${sanitizedUserQuery}%`)
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