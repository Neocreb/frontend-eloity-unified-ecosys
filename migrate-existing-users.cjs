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
              email_confirmed: authUser.email_confirmed || false,
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
              username: null,
              full_name: null,
              name: null,
              bio: null,
              avatar: null,
              avatar_url: null,
              is_verified: false,
              level: 'bronze',
              points: 0,
              role: 'user',
              status: 'active',
              bank_account_name: null,
              bank_account_number: null,
              bank_name: null,
              preferences: {},
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
              usdt_balance: '0',
              eth_balance: '0',
              btc_balance: '0',
              soft_points_balance: '0',
              is_active: true,
              is_frozen: false,
              freeze_reason: null,
              frozen_by: null,
              frozen_at: null,
              backup_seed: null,
              last_backup_at: null,
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