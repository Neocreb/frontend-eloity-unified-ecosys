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

async function checkAdminUsersTable(email: string) {
  console.log(`🚀 Checking admin_users table for email: ${email}\n`);

  try {
    // First get the user ID from the users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_verified')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.error(`❌ User with email ${email} not found in users table`);
      process.exit(1);
    }

    console.log(`👤 User found in users table:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role || 'Not set'}`);
    console.log(`   Is Verified: ${user.is_verified ? 'Yes' : 'No'}`);
    console.log("");

    // Check if user exists in admin_users table
    const { data: adminUser, error: adminUserError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (adminUserError) {
      console.log("⚠️  User not found in admin_users table");
    } else {
      console.log("✅ User found in admin_users table:");
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   User ID: ${adminUser.user_id}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Roles: ${adminUser.roles ? JSON.stringify(adminUser.roles) : '[]'}`);
      console.log(`   Permissions: ${adminUser.permissions ? JSON.stringify(adminUser.permissions) : '[]'}`);
      console.log(`   Is Active: ${adminUser.is_active ? 'Yes' : 'No'}`);
      console.log(`   Created At: ${adminUser.created_at}`);
      console.log("");
    }

    // Check if user exists in admin_permissions table
    const { data: adminPermissions, error: permissionsError } = await supabase
      .from('admin_permissions')
      .select('*')
      .eq('user_id', user.id);

    if (permissionsError) {
      console.error("❌ Error fetching admin permissions:", permissionsError);
    } else if (!adminPermissions || adminPermissions.length === 0) {
      console.log("⚠️  User has no entries in admin_permissions table");
    } else {
      console.log(`📋 Found ${adminPermissions.length} permission entries in admin_permissions table:`);
      adminPermissions.forEach((perm, index) => {
        console.log(`${index + 1}. Role: ${perm.role}`);
        console.log(`   Active: ${perm.is_active ? 'Yes' : 'No'}`);
        console.log(`   Permissions: [${perm.permissions.length} permissions]`);
        console.log("");
      });
    }

    console.log("\n📝 Summary:");
    console.log(`   User Role (users table): ${user.role}`);
    console.log(`   Is Verified (users table): ${user.is_verified ? 'Yes' : 'No'}`);
    console.log(`   In admin_users table: ${adminUser ? 'Yes' : 'No'}`);
    console.log(`   Permission entries: ${adminPermissions ? adminPermissions.length : 0}`);
    
  } catch (error) {
    console.error("❌ Error checking admin users table:", error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2] || "eloityhq@gmail.com";

if (!email) {
  console.error("❌ Email is required");
  console.log("Usage: npm run check-admin-users-table <email>");
  process.exit(1);
}

checkAdminUsersTable(email).catch(console.error);