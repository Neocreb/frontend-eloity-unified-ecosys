const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserTables() {
  console.log('🔍 Checking user table structure...\n');
  
  try {
    // Check users table
    console.log('📋 Checking users table...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(3);
    
    if (usersError) {
      console.log('❌ Error accessing users table:', usersError.message);
    } else {
      console.log('✅ Users table accessible');
      if (usersData && usersData.length > 0) {
        console.log('   Sample users:');
        usersData.forEach(user => {
          console.log(`     - ID: ${user.id}, Email: ${user.email}`);
        });
      } else {
        console.log('   No users found in users table');
      }
    }
    
    // Check profiles table
    console.log('\n📋 Checking profiles table...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(3);
    
    if (profilesError) {
      console.log('❌ Error accessing profiles table:', profilesError.message);
    } else {
      console.log('✅ Profiles table accessible');
      if (profilesData && profilesData.length > 0) {
        console.log('   Sample profiles:');
        profilesData.forEach(profile => {
          console.log(`     - User ID: ${profile.user_id}, Username: ${profile.username || 'N/A'}, Name: ${profile.full_name || 'N/A'}`);
        });
      } else {
        console.log('   No profiles found in profiles table');
      }
    }
    
    // Check auth users
    console.log('\n📋 Checking auth users...');
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.log('❌ Error accessing auth users:', authError.message);
      } else {
        console.log('✅ Auth users accessible');
        if (authUsers && authUsers.users && authUsers.users.length > 0) {
          console.log(`   Found ${authUsers.users.length} auth users`);
          authUsers.users.slice(0, 3).forEach(user => {
            console.log(`     - ID: ${user.id}, Email: ${user.email}, Created: ${user.created_at}`);
          });
        } else {
          console.log('   No auth users found');
        }
      }
    } catch (authErr) {
      console.log('❌ Error accessing auth users:', authErr.message);
    }
    
    // Compare users between tables
    console.log('\n🔍 Comparing users between tables...');
    if (usersData && profilesData && !usersError && !profilesError) {
      const userCount = usersData.length;
      const profileCount = profilesData.length;
      
      console.log(`   Users table: ${userCount} records`);
      console.log(`   Profiles table: ${profileCount} records`);
      
      if (userCount !== profileCount) {
        console.log('   ⚠️  Mismatch between users and profiles count');
      }
    }
    
  } catch (error) {
    console.error('❌ Error during user table check:', error.message);
  }
}

checkUserTables();