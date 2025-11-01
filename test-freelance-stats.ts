import { createClient } from '@supabase/supabase-js';

// Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFreelanceStats() {
  console.log('Testing freelance stats table access...');
  
  try {
    // Try to access the freelance_stats table
    const { data, error } = await supabase
      .from('freelance_stats')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('Error accessing freelance_stats table:', error);
    } else {
      console.log('✓ Successfully accessed freelance_stats table');
      console.log('Data:', data);
    }
    
  } catch (error) {
    console.error('Error testing freelance stats:', error);
  }
}

// Run the test
testFreelanceStats();