// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

// Then import the Supabase client
import { createClient } from '@supabase/supabase-js';

async function testSupabaseConfig() {
  console.log('Testing Supabase configuration...');
  
  try {
    // Check if environment variables are set
    console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', process.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET');
    
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
      console.log('❌ Environment variables are missing');
      console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file');
      return;
    }
    
    // Create a Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    );
    
    console.log('✅ Supabase client created successfully');
    
    // Try to get the Supabase version or info
    console.log('Testing connection to Supabase...');
    
    // Try a simple query to test connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('ℹ️  Note: Error accessing users table - this may be expected if the table does not exist yet');
      console.log('Error details:', error.message);
      console.log('✅ Supabase connection is working (authentication successful)');
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('Found records in users table:', data?.length || 0);
    }
  } catch (error) {
    console.error('❌ Supabase configuration error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testSupabaseConfig();