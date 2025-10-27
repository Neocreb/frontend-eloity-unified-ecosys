const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking stories table structure...');

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStoriesStructure() {
  try {
    // Get all columns from stories table
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error accessing stories table:', error.message);
      return;
    }
    
    console.log('✅ stories table accessible');
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('\n📋 Columns in stories table:');
      columns.forEach(col => {
        console.log(`  - ${col}`);
      });
      
      // Check if user_id exists
      if (columns.includes('user_id')) {
        console.log('\n✅ user_id column exists in stories table');
      } else {
        console.log('\n❌ user_id column does not exist in stories table');
      }
      
      // Check what the primary key might be
      console.log('\n🔍 Checking for primary key...');
      const primaryKeyCandidates = ['id', 'user_id', 'uid', 'uuid'];
      const foundPrimaryKey = primaryKeyCandidates.find(col => columns.includes(col));
      if (foundPrimaryKey) {
        console.log(`✅ Found potential primary key: ${foundPrimaryKey}`);
      } else {
        console.log('⚠️  No common primary key column found');
      }
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

checkStoriesStructure();