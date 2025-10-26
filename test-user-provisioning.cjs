const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUserProvisioning() {
  console.log('🔍 Testing user provisioning...\n');
  
  try {
    // Test creating a new user to see if provisioning works
    console.log('🧪 Testing user provisioning by creating a test user...');
    
    // Note: In a real scenario, this would be done through the signup process
    // For testing, we'll simulate the provisioning process
    
    // Get a user that exists in auth but may not be provisioned
    console.log('📋 Checking for unprovisioned users...');
    
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 5
    });
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
      return;
    }
    
    if (!authUsers || !authUsers.users || authUsers.users.length === 0) {
      console.log('⚠️  No auth users found for testing');
      return;
    }
    
    // Check if the first auth user is provisioned
    const testUser = authUsers.users[0];
    console.log(`\n🔍 Testing user: ${testUser.email} (${testUser.id})`);
    
    // Check if user exists in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUser.id)
      .single();
    
    if (userError) {
      console.log('❌ Error checking user table:', userError.message);
    } else if (userData) {
      console.log('✅ User exists in users table');
    } else {
      console.log('❌ User does not exist in users table');
    }
    
    // Check if user has a profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', testUser.id)
      .single();
    
    if (profileError) {
      console.log('❌ Error checking profiles table:', profileError.message);
    } else if (profileData) {
      console.log('✅ User has a profile');
      console.log(`   Username: ${profileData.username || 'N/A'}`);
      console.log(`   Full Name: ${profileData.full_name || 'N/A'}`);
    } else {
      console.log('❌ User does not have a profile');
    }
    
    // Check if user has a wallet
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', testUser.id)
      .single();
    
    if (walletError) {
      console.log('❌ Error checking wallets table:', walletError.message);
    } else if (walletData) {
      console.log('✅ User has a wallet');
      console.log(`   USDT Balance: ${walletData.usdt_balance}`);
      console.log(`   Soft Points: ${walletData.soft_points_balance}`);
    } else {
      console.log('❌ User does not have a wallet');
    }
    
    // Test searching for users in the platform
    console.log('\n🔍 Testing user search functionality...');
    
    const { data: searchResults, error: searchError } = await supabase
      .from('users')
      .select('id, email')
      .limit(5);
    
    if (searchError) {
      console.log('❌ Error searching users:', searchError.message);
    } else {
      console.log(`✅ User search returned ${searchResults.length} results`);
      searchResults.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`);
      });
    }
    
    // Test joining users with profiles
    console.log('\n🔍 Testing users with profiles join...');
    
    const { data: joinResults, error: joinError } = await supabase
      .from('users')
      .select('id, email, profiles(username, full_name)')
      .limit(5);
    
    if (joinError) {
      console.log('❌ Error joining users with profiles:', joinError.message);
    } else {
      console.log(`✅ Join returned ${joinResults.length} results`);
      joinResults.forEach(user => {
        console.log(`   - ${user.email} -> ${user.profiles?.username || 'No profile'}`);
      });
    }
    
    console.log('\n🎉 User provisioning test completed!');
    
  } catch (error) {
    console.error('❌ Error during user provisioning test:', error.message);
  }
}

testUserProvisioning();