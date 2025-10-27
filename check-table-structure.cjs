const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableStructure() {
  console.log('🔍 Checking table structures...\n');
  
  try {
    // Check users table structure
    console.log('📋 Users table structure:');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Error accessing users table:', usersError.message);
    } else if (usersData && usersData.length > 0) {
      const user = usersData[0];
      console.log('   Columns:');
      Object.keys(user).forEach(key => {
        console.log(`     - ${key}: ${typeof user[key]}`);
      });
    } else {
      console.log('   No data found in users table');
    }
    
    // Check profiles table structure
    console.log('\n📋 Profiles table structure:');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Error accessing profiles table:', profilesError.message);
    } else if (profilesData && profilesData.length > 0) {
      const profile = profilesData[0];
      console.log('   Columns:');
      Object.keys(profile).forEach(key => {
        console.log(`     - ${key}: ${typeof profile[key]}`);
      });
    } else {
      console.log('   No data found in profiles table');
    }
    
    // Check wallets table structure
    console.log('\n📋 Wallets table structure:');
    const { data: walletsData, error: walletsError } = await supabase
      .from('wallets')
      .select('*')
      .limit(1);
    
    if (walletsError) {
      console.log('❌ Error accessing wallets table:', walletsError.message);
    } else if (walletsData && walletsData.length > 0) {
      const wallet = walletsData[0];
      console.log('   Columns:');
      Object.keys(wallet).forEach(key => {
        console.log(`     - ${key}: ${typeof wallet[key]}`);
      });
    } else {
      console.log('   No data found in wallets table');
    }
    
  } catch (error) {
    console.error('❌ Error during table structure check:', error.message);
  }
}

checkTableStructure();