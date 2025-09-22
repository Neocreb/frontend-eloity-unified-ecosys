import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function testSupabaseConnection() {
  try {
    // Create a Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    );
    
    console.log('Supabase client created successfully');
    
    // Try to fetch data from a table (if exists)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Error querying users table:', error.message);
      // Try to create a test user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            email: 'test@example.com',
            full_name: 'Test User'
          }
        ]);
      
      if (userError) {
        console.log('Error creating test user:', userError.message);
      } else {
        console.log('Test user created successfully:', userData);
      }
    } else {
      console.log('Successfully queried users table. Found records:', data.length);
    }
  } catch (error) {
    console.error('Supabase connection error:', error.message);
  }
}

testSupabaseConnection();