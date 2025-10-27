const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRemainingProvisioning() {
  console.log('🔧 Fixing remaining provisioning issues...\n');
  
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
      .select('id');
    
    if (appUsersError) {
      console.error('❌ Error fetching application users:', appUsersError.message);
      return;
    }
    
    const appUserIds = new Set(appUsers.map(user => user.id));
    console.log(`✅ Found ${appUserIds.size} application users`);
    
    // Get profiles
    console.log('\n📋 Getting profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id');
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message);
      return;
    }
    
    const profileUserIds = new Set(profiles.map(profile => profile.user_id));
    console.log(`✅ Found ${profileUserIds.size} profiles`);
    
    // Get wallets
    console.log('\n📋 Getting wallets...');
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('user_id');
    
    if (walletsError) {
      console.error('❌ Error fetching wallets:', walletsError.message);
      return;
    }
    
    const walletUserIds = new Set(wallets.map(wallet => wallet.user_id));
    console.log(`✅ Found ${walletUserIds.size} wallets`);
    
    // Fix missing profiles and wallets
    let profilesCreated = 0;
    let walletsCreated = 0;
    
    for (const authUser of authUsers.users) {
      const userId = authUser.id;
      
      // Create profile if missing
      if (!profileUserIds.has(userId)) {
        console.log(`\n➕ Creating profile for ${authUser.email} (${userId})`);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: randomUUID(), // Use crypto.randomUUID() to generate UUID
              user_id: userId,
              name: null,
              avatar: null,
              bio: null,
              role: 'user',
              status: 'active',
              preferences: {},
              username: null,
              full_name: null,
              avatar_url: null,
              is_verified: false,
              points: 0,
              level: 'bronze',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
        
        if (profileError) {
          console.error('   ❌ Error creating profile:', profileError.message);
        } else {
          console.log('   ✅ Profile created');
          profilesCreated++;
          profileUserIds.add(userId);
        }
      }
      
      // Create wallet if missing
      if (!walletUserIds.has(userId)) {
        console.log(`\n➕ Creating wallet for ${authUser.email} (${userId})`);
        
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .insert([
            {
              user_id: userId,
              btc_balance: 0,
              eth_balance: 0,
              sol_balance: 0,
              usdt_balance: 0,
              softpoints_balance: 0,
              kyc_verified: false,
              kyc_level: 0,
              kyc_documents: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
        
        if (walletError) {
          console.error('   ❌ Error creating wallet:', walletError.message);
        } else {
          console.log('   ✅ Wallet created');
          walletsCreated++;
          walletUserIds.add(userId);
        }
      }
    }
    
    console.log('\n🎉 Provisioning fix completed!');
    console.log(`   Profiles created: ${profilesCreated}`);
    console.log(`   Wallets created: ${walletsCreated}`);
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const { data: finalProfiles, error: finalProfilesError } = await supabase
      .from('profiles')
      .select('user_id');
    
    if (!finalProfilesError) {
      console.log(`✅ Total profiles now: ${finalProfiles.length}`);
    }
    
    const { data: finalWallets, error: finalWalletsError } = await supabase
      .from('wallets')
      .select('user_id');
    
    if (!finalWalletsError) {
      console.log(`✅ Total wallets now: ${finalWallets.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error during provisioning fix:', error.message);
  }
}

fixRemainingProvisioning();