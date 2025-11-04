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

async function testPageFollowersQuery() {
  console.log('🔍 Testing page_followers query...');
  
  try {
    // Test the exact query that's failing
    console.log('\n🔍 Testing specific query...');
    const pageId = '965334ff-901e-4cf8-b62e-02709a156d91';
    const userId = '00000000-0000-0000-0000-000000000000'; // Different user ID
    
    const { data, error } = await supabase
      .from('page_followers')
      .select('id')
      .eq('page_id', pageId)
      .eq('user_id', userId);
    
    if (error) {
      console.log('❌ Query failed:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Query succeeded');
      console.log('Data returned:', data);
    }
    
    // Test a simpler query
    console.log('\n🔍 Testing simpler query...');
    const { data: simpleData, error: simpleError } = await supabase
      .from('page_followers')
      .select('id')
      .limit(1);
    
    if (simpleError) {
      console.log('❌ Simple query failed:', simpleError.message);
    } else {
      console.log('✅ Simple query succeeded');
      console.log('Data returned:', simpleData);
    }
    
    // Test inserting a record with a different user ID
    console.log('\n🔍 Testing insert with new user...');
    const { data: insertData, error: insertError } = await supabase
      .from('page_followers')
      .insert({
        page_id: pageId,
        user_id: userId,
      })
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
    } else {
      console.log('✅ Insert succeeded');
      console.log('Data inserted:', insertData);
    }
    
  } catch (error) {
    console.error('❌ Error testing page_followers:', error.message);
    process.exit(1);
  }
}

testPageFollowersQuery();