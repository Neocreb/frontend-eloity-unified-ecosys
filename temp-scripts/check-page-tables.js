import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPageTables() {
  console.log('🔍 Checking page-related tables...');
  
  try {
    // Check if page_follows table exists and is accessible
    console.log('\n🔍 Checking page_follows table...');
    const { data: followsData, error: followsError } = await supabase
      .from('page_follows')
      .select('id')
      .limit(1);
    
    if (followsError) {
      console.log('❌ page_follows table error:', followsError.message);
    } else {
      console.log('✅ page_follows table accessible');
      console.log('Sample data count:', followsData?.length || 0);
    }
    
    // Check if page_followers table exists (this should fail)
    console.log('\n🔍 Checking page_followers table...');
    const { data: followersData, error: followersError } = await supabase
      .from('page_followers')
      .select('id')
      .limit(1);
    
    if (followersError) {
      console.log('❌ page_followers table error:', followersError.message);
      console.log('This confirms the table name mismatch issue.');
    } else {
      console.log('✅ page_followers table accessible');
      console.log('Sample data count:', followersData?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Error checking page tables:', error.message);
    process.exit(1);
  }
}

checkPageTables();