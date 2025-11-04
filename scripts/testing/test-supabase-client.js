import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  console.log('SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
  console.log('SUPABASE_KEY:', process.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '***REDACTED***' : 'NOT SET');
  
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    );
    
    // Try to fetch a simple record
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase query failed:', error.message);
      console.error('Error code:', error.code);
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('Query result:', data);
    }
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
  }
}

testSupabaseConnection();