#!/usr/bin/env npx tsx

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env.local
config({ path: '.env.local' });

async function testAdminUserEndpoint() {
  console.log("🚀 Testing admin user endpoint\n");

  try {
    // Get the user ID for eloityhq@gmail.com
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Supabase URL and Service Role Key are required");
      process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'eloityhq@gmail.com')
      .single();

    if (userError || !user) {
      console.error("❌ User not found:", userError?.message || "User not found");
      process.exit(1);
    }

    console.log(`👤 User ID for eloityhq@gmail.com: ${user.id}`);

    // Test the admin user endpoint directly through Supabase
    console.log("\n🔍 Testing admin user data through Supabase...");
    
    const { data: adminUser, error: adminUserError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (adminUserError) {
      console.error("❌ Error fetching admin user from Supabase:", adminUserError.message);
    } else {
      console.log("✅ Admin user found in Supabase:");
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   User ID: ${adminUser.user_id}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Roles: ${JSON.stringify(adminUser.roles)}`);
      console.log(`   Permissions: ${JSON.stringify(adminUser.permissions)}`);
      console.log(`   Is Active: ${adminUser.is_active}`);
    }

    // Test the admin permissions endpoint directly through Supabase
    console.log("\n🔍 Testing admin permissions through Supabase...");
    
    const { data: adminPermissions, error: permissionsError } = await supabase
      .from('admin_permissions')
      .select('*')
      .eq('user_id', user.id);

    if (permissionsError) {
      console.error("❌ Error fetching admin permissions from Supabase:", permissionsError.message);
    } else if (!adminPermissions || adminPermissions.length === 0) {
      console.log("⚠️  No admin permissions found for user");
    } else {
      console.log(`✅ Found ${adminPermissions.length} permission entries:`);
      adminPermissions.forEach((perm, index) => {
        console.log(`${index + 1}. Role: ${perm.role}`);
        console.log(`   Active: ${perm.is_active}`);
        console.log(`   Permissions: [${perm.permissions.length} permissions]`);
      });
    }

    console.log("\n✅ All tests completed successfully!");
    
  } catch (error) {
    console.error("❌ Error testing admin user endpoint:", error);
    process.exit(1);
  }
}

testAdminUserEndpoint().catch(console.error);