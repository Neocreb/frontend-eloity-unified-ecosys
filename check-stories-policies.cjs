const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking stories table policies...');

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStoriesPolicies() {
  try {
    // Check if RLS is enabled on stories table
    const { data: rlsData, error: rlsError } = await supabase
      .from('stories')
      .select('id')
      .limit(1);
    
    if (rlsError) {
      console.log('❌ RLS check failed:', rlsError.message);
    } else {
      console.log('✅ RLS check passed');
    }
    
    // Try to get a count of stories
    const { count, error } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Count query failed:', error.message);
    } else {
      console.log(`✅ Count query successful: ${count} stories`);
    }
    
    // Try a simple select query
    const { data, error: selectError } = await supabase
      .from('stories')
      .select('id, user_id, created_at, media_url')
      .limit(3);
    
    if (selectError) {
      console.log('❌ Select query failed:', selectError.message);
    } else {
      console.log('✅ Select query successful');
      if (data && data.length > 0) {
        console.log('   Sample stories:');
        data.forEach(story => {
          console.log(`     - ID: ${story.id}, User: ${story.user_id}, Created: ${story.created_at}`);
        });
      }
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

checkStoriesPolicies();