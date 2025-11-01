// @ts-ignore - Solana dependency issue in Supabase auth-js
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Supabase connection - use process.env for Node.js environments
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in environment variables');
  console.error('Please set VITE_SUPABASE_URL and either VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY in your .env file');
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