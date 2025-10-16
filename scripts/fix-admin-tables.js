// Script to fix admin tables and insert default data
import dotenv from 'dotenv';
dotenv.config();

async function fixAdminTables() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    // Check if Supabase credentials are set
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
      console.log('❌ Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file');
      process.exit(1);
    }
    
    // Create a Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    );
    
    console.log('✅ Connected to Supabase');
    
    // First, let's check if we can access the users table to find the admin user
    console.log('Checking for admin user in users table...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@eloity.com')
      .single();
    
    if (userError) {
      console.log('❌ Error querying users table:', userError.message);
      // Try to create a test user
      console.log('Creating test admin user...');
      const { data: newUser, error: newUserError } = await supabase
        .from('users')
        .insert({
          email: 'admin@eloity.com',
          username: 'admin',
          full_name: 'Administrator',
          is_verified: true,
          role: 'admin'
        })
        .select()
        .single();
      
      if (newUserError) {
        console.log('❌ Error creating admin user:', newUserError.message);
        process.exit(1);
      }
      
      console.log('✅ Created admin user:', newUser);
    } else {
      console.log('✅ Found admin user:', userData.email);
    }
    
    // Now let's try to insert the admin user data
    console.log('Inserting admin user data...');
    const { data: adminUserData, error: adminUserError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', 'admin@eloity.com')
      .single();
    
    if (adminUserError) {
      console.log('❌ Error getting admin user data:', adminUserError.message);
      process.exit(1);
    }
    
    // Try to insert into admin_users table
    const adminData = {
      user_id: adminUserData.id,
      email: adminUserData.email,
      name: adminUserData.full_name,
      roles: ['super_admin'],
      permissions: [
        'admin.all',
        'users.all',
        'content.all',
        'marketplace.all',
        'crypto.all',
        'freelance.all',
        'settings.all',
        'moderation.all'
      ],
      is_active: true
    };
    
    console.log('Inserting admin user record...');
    const { data: insertData, error: insertError } = await supabase
      .from('admin_users')
      .insert(adminData)
      .select();
    
    if (insertError) {
      console.log('❌ Error inserting admin user:', insertError.message);
      // Try to update if it already exists
      console.log('Trying to update existing admin user...');
      const { data: updateData, error: updateError } = await supabase
        .from('admin_users')
        .update(adminData)
        .eq('user_id', adminUserData.id)
        .select();
      
      if (updateError) {
        console.log('❌ Error updating admin user:', updateError.message);
      } else {
        console.log('✅ Updated admin user:', updateData);
      }
    } else {
      console.log('✅ Inserted admin user:', insertData);
    }
    
    // Insert platform settings
    console.log('Inserting platform settings...');
    const platformSettings = [
      {
        key: 'platform_name',
        value: JSON.stringify('Eloity Platform'),
        category: 'general',
        description: 'Platform display name',
        is_public: true
      },
      {
        key: 'maintenance_mode',
        value: JSON.stringify(false),
        category: 'general',
        description: 'Enable maintenance mode',
        is_public: false
      },
      {
        key: 'chat_ads_enabled',
        value: JSON.stringify(true),
        category: 'chat',
        description: 'Enable chat advertisements',
        is_public: true
      },
      {
        key: 'moderation_auto_flag_threshold',
        value: JSON.stringify(0.85),
        category: 'moderation',
        description: 'AI confidence threshold for auto-flagging',
        is_public: false
      }
    ];
    
    for (const setting of platformSettings) {
      const { error: settingError } = await supabase
        .from('platform_settings')
        .insert(setting);
      
      if (settingError) {
        console.log(`Note: Could not insert setting ${setting.key}:`, settingError.message);
        // Try to update if it already exists
        const { error: updateError } = await supabase
          .from('platform_settings')
          .update(setting)
          .eq('key', setting.key);
        
        if (updateError) {
          console.log(`Note: Could not update setting ${setting.key}:`, updateError.message);
        } else {
          console.log(`✅ Updated setting ${setting.key}`);
        }
      } else {
        console.log(`✅ Inserted setting ${setting.key}`);
      }
    }
    
    console.log('\n🎉 Admin tables fixed and default data inserted successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAdminTables();