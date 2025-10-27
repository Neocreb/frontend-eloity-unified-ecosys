const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfilesStructure() {
  console.log('🔍 Checking profiles table structure...\n');
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('📋 Profiles table columns:');
      Object.keys(data[0]).forEach(key => {
        console.log(`  - ${key}`);
      });
    } else {
      console.log('No data found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkProfilesStructure();