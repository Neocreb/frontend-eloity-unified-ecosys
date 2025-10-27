const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyUserProvisioning() {
  console.log('🔍 Verifying user provisioning...\n');
  
  try {
    // Get auth users
    console.log('📋 Getting auth users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
      return;
    }
    
    console.log(`✅ Found ${authUsers.users.length} auth users`);
    
    // Get application users
    console.log('\n📋 Getting application users...');
    const { data: appUsers, error: appUsersError } = await supabase
      .from('users')
      .select('id, email');
    
    if (appUsersError) {
      console.error('❌ Error fetching application users:', appUsersError.message);
      return;
    }
    
    console.log(`✅ Found ${appUsers.length} application users`);
    
    // Get profiles
    console.log('\n📋 Getting profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id');
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message);
      return;
    }
    
    console.log(`✅ Found ${profiles.length} profiles`);
    
    // Get wallets
    console.log('\n📋 Getting wallets...');
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('user_id');
    
    if (walletsError) {
      console.error('❌ Error fetching wallets:', walletsError.message);
      return;
    }
    
    console.log(`✅ Found ${wallets.length} wallets`);
    
    // Create sets for easier lookup
    const appUserIds = new Set(appUsers.map(user => user.id));
    const profileUserIds = new Set(profiles.map(profile => profile.user_id));
    const walletUserIds = new Set(wallets.map(wallet => wallet.user_id));
    
    // Check for any mismatches
    let mismatches = 0;
    
    for (const authUser of authUsers.users) {
      const userId = authUser.id;
      
      if (!appUserIds.has(userId)) {
        console.log(`❌ User ${authUser.email} (${userId}) missing from users table`);
        mismatches++;
      }
      
      if (!profileUserIds.has(userId)) {
        console.log(`❌ User ${authUser.email} (${userId}) missing profile`);
        mismatches++;
      }
      
      if (!walletUserIds.has(userId)) {
        console.log(`❌ User ${authUser.email} (${userId}) missing wallet`);
        mismatches++;
      }
    }
    
    if (mismatches === 0) {
      console.log('\n🎉 All users are properly provisioned!');
      console.log('   ✅ All auth users have entries in users table');
      console.log('   ✅ All auth users have profiles');
      console.log('   ✅ All auth users have wallets');
    } else {
      console.log(`\n⚠️  Found ${mismatches} provisioning issues`);
    }
    
    // Test searching for users
    console.log('\n🔍 Testing user search functionality...');
    
    const { data: searchResults, error: searchError } = await supabase
      .from('users')
      .select('id, email, profiles(username, full_name)')
      .limit(5);
    
    if (searchError) {
      console.log('❌ Error searching users:', searchError.message);
    } else {
      console.log(`✅ User search returned ${searchResults.length} results`);
      searchResults.forEach(user => {
        console.log(`   - ${user.email} (${user.profiles?.username || 'No username'})`);
      });
    }
    
    console.log('\n🎉 User provisioning verification completed!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  }
}

verifyUserProvisioning();