import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function createTables() {
  console.log('Creating tables using Supabase REST API...');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  // Create a simple users table
  try {
    const { data, error } = await supabase.rpc('create_users_table');
    
    if (error) {
      console.log('Function may not exist, creating table directly...');
      
      // Try to create the table directly
      const { error: createError } = await supabase
        .from('users')
        .insert({
          email: 'test@example.com',
          username: 'testuser',
          full_name: 'Test User'
        });
      
      if (createError && createError.code === '42P01') {
        console.log('Table does not exist, need to create it via migration');
      } else if (createError) {
        console.error('Error inserting test user:', createError.message);
      } else {
        console.log('✅ Successfully inserted test user');
      }
    } else {
      console.log('✅ Tables created successfully');
    }
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
}

createTables();