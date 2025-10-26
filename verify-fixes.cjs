const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔍 Verifying database fixes...');

// Create Supabase client with anon key (similar to frontend)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyFixes() {
  console.log('\n🔍 Testing the previously failing stories query with profiles join...');
  
  try {
    // This is the exact query that was failing before
    const { data, error } = await supabase
      .from('stories')
      .select('id,user_id,created_at,media_url,profiles:user_id(username,full_name,avatar_url)')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.log('❌ Stories query with profiles join still failing:', error.message);
      console.log('   Error code:', error.code);
      if (error.details) console.log('   Error details:', error.details);
      if (error.hint) console.log('   Error hint:', error.hint);
    } else {
      console.log('✅ Stories query with profiles join is now working!');
      if (data && data.length > 0) {
        console.log(`   Retrieved ${data.length} stories with profile data`);
        data.forEach(story => {
          console.log(`     - Story ${story.id.substring(0,8)}... by ${story.profiles?.username || story.profiles?.full_name || 'Unknown'}`);
        });
      } else {
        console.log('   No stories found (which is OK)');
      }
    }
  } catch (err) {
    console.log('❌ Stories query with profiles join error:', err.message);
  }
  
  console.log('\n🔍 Testing posts query with profiles join...');
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id,user_id,content,profiles:user_id(username,full_name,avatar_url)')
      .limit(5);
    
    if (error) {
      console.log('❌ Posts query with profiles join failing:', error.message);
    } else {
      console.log('✅ Posts query with profiles join is working!');
      if (data && data.length > 0) {
        console.log(`   Retrieved ${data.length} posts with profile data`);
      }
    }
  } catch (err) {
    console.log('❌ Posts query with profiles join error:', err.message);
  }
  
  console.log('\n🔍 Testing the new helper views...');
  try {
    const { data, error } = await supabase
      .from('stories_with_profiles')
      .select('id,user_id,username,full_name,created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log('❌ stories_with_profiles view query failing:', error.message);
    } else {
      console.log('✅ stories_with_profiles view query is working!');
      if (data && data.length > 0) {
        console.log(`   Retrieved ${data.length} stories from view`);
      }
    }
  } catch (err) {
    console.log('❌ stories_with_profiles view query error:', err.message);
  }
  
  console.log('\n🔍 Testing live streams query...');
  try {
    const { data, error } = await supabase
      .from('live_streams')
      .select('*')
      .eq('is_active', true)
      .order('viewer_count', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log('❌ Live streams query failing:', error.message);
    } else {
      console.log('✅ Live streams query is working!');
      if (data && data.length > 0) {
        console.log(`   Retrieved ${data.length} live streams`);
      }
    }
  } catch (err) {
    console.log('❌ Live streams query error:', err.message);
  }
  
  console.log('\n🔍 Testing battles query...');
  try {
    const { data, error } = await supabase
      .from('battles')
      .select('*')
      .in('status', ['pending', 'active'])
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log('❌ Battles query failing:', error.message);
    } else {
      console.log('✅ Battles query is working!');
      if (data && data.length > 0) {
        console.log(`   Retrieved ${data.length} battles`);
      }
    }
  } catch (err) {
    console.log('❌ Battles query error:', err.message);
  }
  
  console.log('\n✅ Verification complete!');
}

verifyFixes();