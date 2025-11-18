import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function testDBAccess() {
  try {
    console.log('Testing database access...');
    console.log('Supabase URL:', process.env.VITE_SUPABASE_URL);
    console.log('Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Create a Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Try a simple query
    console.log('Attempting to query group_chat_threads table...');
    const { data, error } = await supabase
      .from('group_chat_threads')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Error querying group_chat_threads:', error.message);
      console.log('Error code:', error.code);
    } else {
      console.log('✅ Successfully queried group_chat_threads');
      console.log('Data:', data);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

testDBAccess();