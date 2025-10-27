const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateExistingUsers() {
  console.log('🔄 Migrating existing auth users to application tables...\n');
  
  try {
    // Get all auth users
    console.log('📋 Fetching auth users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
      return;
    }
    
    console.log(`✅ Found ${authUsers.users.length} auth users`);
    
    // Get existing users in the users table
    console.log('\n📋 Checking existing application users...');
    const { data: existingUsers, error: existingUsersError } = await supabase
      .from('users')
      .select('id');
    
    if (existingUsersError) {
      console.error('❌ Error fetching existing users:', existingUsersError.message);
      return;
    }
    
    const existingUserIds = new Set(existingUsers.map(user => user.id));
    console.log(`✅ Found ${existingUserIds.size} existing application users`);
    
    // Get existing profiles
    console.log('\n📋 Checking existing profiles...');
    const { data: existingProfiles, error: existingProfilesError } = await supabase
      .from('profiles')
      .select('user_id');
    
    if (existingProfilesError) {
      console.error('❌ Error fetching existing profiles:', existingProfilesError.message);
      return;
    }
    
    const existingProfileIds = new Set(existingProfiles.map(profile => profile.user_id));
    console.log(`✅ Found ${existingProfileIds.size} existing profiles`);
    
    // Get existing wallets
    console.log('\n📋 Checking existing wallets...');
    const { data: existingWallets, error: existingWalletsError } = await supabase
      .from('wallets')
      .select('user_id');
    
    if (existingWalletsError) {
      console.error('❌ Error fetching existing wallets:', existingWalletsError.message);
      return;
    }
    
    const existingWalletIds = new Set(existingWallets.map(wallet => wallet.user_id));
    console.log(`✅ Found ${existingWalletIds.size} existing wallets`);
    
    // Process each auth user
    let usersCreated = 0;
    let profilesCreated = 0;
    let walletsCreated = 0;
    
    for (const authUser of authUsers.users) {
      console.log(`\n🔄 Processing user: ${authUser.email} (${authUser.id})`);
      
      // Create user entry if it doesn't exist
      if (!existingUserIds.has(authUser.id)) {
        console.log('   ➕ Creating user entry...');
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: authUser.id,
              email: authUser.email,
              username: null,
              full_name: null,
              avatar_url: null,
              banner_url: null,
              bio: null,
              location: null,
              website: null,
              phone: null,
              date_of_birth: null,
              gender: null,
              is_verified: false,
              points: 0,
              level: 'bronze',
              role: 'user',
              reputation: 0,
              followers_count: 0,
              following_count: 0,
              posts_count: 0,
              profile_views: 0,
              is_online: false,
              last_active: null,
              profile_visibility: 'public',
              allow_direct_messages: true,
              allow_notifications: true,
              preferred_currency: 'USDT',
              timezone: null,
              created_at: authUser.created_at,
              updated_at: new Date().toISOString()
            }
          ]);
        
        if (userError) {
          console.error('   ❌ Error creating user:', userError.message);
        } else {
          console.log('   ✅ User entry created');
          usersCreated++;
          existingUserIds.add(authUser.id);
        }
      } else {
        console.log('   ✅ User entry already exists');
      }
      
      // Create profile entry if it doesn't exist
      if (!existingProfileIds.has(authUser.id)) {
        console.log('   ➕ Creating profile entry...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: authUser.id,
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
          console.log('   ✅ Profile entry created');
          profilesCreated++;
          existingProfileIds.add(authUser.id);
        }
      } else {
        console.log('   ✅ Profile entry already exists');
      }
      
      // Create wallet entry if it doesn't exist
      if (!existingWalletIds.has(authUser.id)) {
        console.log('   ➕ Creating wallet entry...');
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .insert([
            {
              user_id: authUser.id,
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
          console.log('   ✅ Wallet entry created');
          walletsCreated++;
          existingWalletIds.add(authUser.id);
        }
      } else {
        console.log('   ✅ Wallet entry already exists');
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log(`   Users created: ${usersCreated}`);
    console.log(`   Profiles created: ${profilesCreated}`);
    console.log(`   Wallets created: ${walletsCreated}`);
    
  } catch (error) {
    console.error('❌ Error during user migration:', error.message);
  }
}

migrateExistingUsers();