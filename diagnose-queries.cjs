const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔍 Diagnosing problematic queries...');
console.log('====================================');

// Check if we have the required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing Supabase environment variables');
  console.log('   VITE_SUPABASE_URL:', supabaseUrl ? '✓ Present' : '✗ Missing');
  console.log('   VITE_SUPABASE_PUBLISHABLE_KEY:', supabaseAnonKey ? '✓ Present' : '✗ Missing');
  process.exit(1);
}

console.log('✅ Supabase environment variables loaded');

// Create Supabase client with anon key (similar to frontend)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseQueries() {
  // Test 1: Posts query with profiles join (the one causing 400 error)
  console.log('\n🔍 Testing posts query with profiles join...');
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Posts basic query failed:', error.message);
    } else {
      console.log('✅ Posts basic query successful');
    }
  } catch (err) {
    console.log('❌ Posts basic query error:', err.message);
  }
  
  // Test 2: Stories query with profiles join (the one causing 400 error)
  console.log('\n🔍 Testing stories query with profiles join...');
  try {
    // This is the exact query from the error message
    const { data, error } = await supabase
      .from('stories')
      .select('id,user_id,created_at,media_url,profiles:user_id(username,full_name,avatar_url)')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.log('❌ Stories query with profiles join failed:', error.message);
      console.log('   Error code:', error.code);
      console.log('   Error details:', error.details);
      console.log('   Error hint:', error.hint);
    } else {
      console.log('✅ Stories query with profiles join successful');
    }
  } catch (err) {
    console.log('❌ Stories query with profiles join error:', err.message);
  }
  
  // Test 3: Check if we can access profiles with user_id
  console.log('\n🔍 Testing profiles access with user_id...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id,username,full_name,avatar_url')
      .limit(1);
    
    if (error) {
      console.log('❌ Profiles access failed:', error.message);
    } else {
      console.log('✅ Profiles access successful');
      if (data && data.length > 0) {
        console.log('   Sample profile:', JSON.stringify(data[0], null, 2));
      }
    }
  } catch (err) {
    console.log('❌ Profiles access error:', err.message);
  }
  
  // Test 4: Live streams query
  console.log('\n🔍 Testing live streams query...');
  try {
    const { data, error } = await supabase
      .from('live_streams')
      .select('*')
      .eq('is_active', true)
      .order('viewer_count', { ascending: false })
      .limit(20);
    
    if (error) {
      console.log('❌ Live streams query failed:', error.message);
    } else {
      console.log('✅ Live streams query successful');
    }
  } catch (err) {
    console.log('❌ Live streams query error:', err.message);
  }
  
  // Test 5: Battles query
  console.log('\n🔍 Testing battles query...');
  try {
    const { data, error } = await supabase
      .from('battles')
      .select('*')
      .in('status', ['pending', 'active'])
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Battles query failed:', error.message);
    } else {
      console.log('✅ Battles query successful');
    }
  } catch (err) {
    console.log('❌ Battles query error:', err.message);
  }
  
  // Test 6: Check if we can get the current user
  console.log('\n🔍 Testing auth status...');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('❌ Auth check failed:', error.message);
    } else {
      if (user) {
        console.log('✅ User authenticated:', user.id);
      } else {
        console.log('⚠️  No user authenticated');
      }
    }
  } catch (err) {
    console.log('❌ Auth check error:', err.message);
  }
}

diagnoseQueries();