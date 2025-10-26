const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Simple database testing...');

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function simpleTest() {
  console.log('\n🔍 Testing basic table access...');
  
  // Test stories table
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('id,user_id,created_at')
      .limit(1);
    
    if (error) {
      console.log('❌ Stories table access failed:', error.message);
    } else {
      console.log('✅ Stories table access successful');
    }
  } catch (err) {
    console.log('❌ Stories table access error:', err.message);
  }
  
  // Test profiles table
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id,username,full_name')
      .limit(1);
    
    if (error) {
      console.log('❌ Profiles table access failed:', error.message);
    } else {
      console.log('✅ Profiles table access successful');
    }
  } catch (err) {
    console.log('❌ Profiles table access error:', err.message);
  }
  
  // Test the problematic join query
  console.log('\n🔍 Testing stories with profiles join (the problematic query)...');
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('id,user_id,created_at,profiles:user_id(username,full_name,avatar_url)')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.log('❌ Stories with profiles join failed:', error.message);
      console.log('   This confirms the foreign key relationship issue');
    } else {
      console.log('✅ Stories with profiles join successful');
    }
  } catch (err) {
    console.log('❌ Stories with profiles join error:', err.message);
  }
  
  // Test individual table access to verify they work independently
  console.log('\n🔍 Testing individual table access...');
  
  try {
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id,user_id,created_at')
      .limit(3);
    
    if (storiesError) {
      console.log('❌ Stories access failed:', storiesError.message);
    } else {
      console.log('✅ Stories access successful');
      if (stories && stories.length > 0) {
        console.log(`   Found ${stories.length} stories`);
        stories.forEach(story => {
          console.log(`     - Story ${story.id} by user ${story.user_id}`);
        });
      }
    }
  } catch (err) {
    console.log('❌ Stories access error:', err.message);
  }
  
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id,username,full_name')
      .limit(3);
    
    if (profilesError) {
      console.log('❌ Profiles access failed:', profilesError.message);
    } else {
      console.log('✅ Profiles access successful');
      if (profiles && profiles.length > 0) {
        console.log(`   Found ${profiles.length} profiles`);
        profiles.forEach(profile => {
          console.log(`     - Profile for user ${profile.user_id}: ${profile.username || profile.full_name}`);
        });
      }
    }
  } catch (err) {
    console.log('❌ Profiles access error:', err.message);
  }
}

simpleTest();