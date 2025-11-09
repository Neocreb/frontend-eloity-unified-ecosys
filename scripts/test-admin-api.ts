#!/usr/bin/env npx tsx

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env.local
config({ path: '.env.local' });

// Setup Supabase client with service role key to bypass RLS
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Supabase URL and Service Role Key are required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAdminApi() {
  console.log("🚀 Testing admin API endpoints\n");

  try {
    // Get the user ID for eloityhq@gmail.com
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_verified')
      .eq('email', 'eloityhq@gmail.com')
      .single();

    if (userError || !user) {
      console.error("❌ User not found:", userError?.message || "User not found");
      process.exit(1);
    }

    console.log("👤 User found:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Is Verified: ${user.is_verified}`);
    console.log("");

    // Test if we can get admin user data directly from Supabase
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
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Roles: ${JSON.stringify(adminUser.roles)}`);
      console.log(`   Permissions: ${JSON.stringify(adminUser.permissions)}`);
      console.log(`   Is Active: ${adminUser.is_active}`);
      console.log("");
    }

    // Test if we can get admin permissions directly from Supabase
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
        console.log("");
      });
    }

    console.log("✅ All database checks completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Make sure the backend server is running");
    console.log("2. Check if the API endpoints are accessible");
    console.log("3. Verify the frontend is making requests to the correct URL");
    
  } catch (error) {
    console.error("❌ Error testing admin API:", error);
    process.exit(1);
  }
}

testAdminApi().catch(console.error);