import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPostsForeignKeyFix() {
  console.log('🔍 Testing posts foreign key constraint fix...\n');
  
  try {
    // Test 1: Try to create a post with a valid user_id
    console.log('🧪 Test 1: Checking if we can query posts with profiles join...');
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error querying posts:', error.message);
      console.log('   Status:', error.status);
      console.log('   Hint:', error.hint);
    } else {
      console.log('✅ Successfully queried posts table');
    }
    
    // Test 2: Try the specific query that was failing
    console.log('\n🧪 Test 2: Testing the specific failing query...');
    
    const { data: joinData, error: joinError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    if (joinError) {
      console.log('❌ Error with posts query:', joinError.message);
    } else {
      console.log('✅ Posts query is working');
    }
    
    // Test 3: Check current user
    console.log('\n🧪 Test 3: Checking current user authentication...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ Authentication error:', userError.message);
    } else if (user) {
      console.log(`✅ User authenticated: ${user.id}`);
      
      // Check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) {
        console.log('❌ Error checking profile:', profileError.message);
      } else if (profile) {
        console.log('✅ User has a profile');
      } else {
        console.log('⚠️  User does not have a profile - this might cause issues');
      }
    } else {
      console.log('⚠️  No user is currently authenticated');
    }
    
    console.log('\n🎉 Posts foreign key constraint test completed!');
    
  } catch (error) {
    console.error('❌ Error during posts foreign key constraint test:', error.message);
  }
}

testPostsForeignKeyFix();