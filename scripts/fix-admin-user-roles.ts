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

async function fixAdminUserRoles(email: string) {
  console.log(`🚀 Fixing admin user roles for email: ${email}\n`);

  try {
    // First get the user ID from the users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.error(`❌ User with email ${email} not found in users table`);
      process.exit(1);
    }

    console.log(`👤 User found:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log("");

    // Get current admin user data
    const { data: adminUser, error: adminUserError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (adminUserError || !adminUser) {
      console.error("❌ Admin user not found in admin_users table");
      process.exit(1);
    }

    console.log("🔧 Current admin user data:");
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Roles: ${JSON.stringify(adminUser.roles)}`);
    console.log(`   Permissions: ${JSON.stringify(adminUser.permissions)}`);
    console.log(`   Is Active: ${adminUser.is_active ? 'Yes' : 'No'}`);
    console.log("");

    // Update the admin user with proper roles
    const roles = ['super_admin'];
    
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        roles: roles,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminUser.id);

    if (updateError) {
      console.error("❌ Error updating admin user:", updateError);
      process.exit(1);
    }

    console.log("✅ Admin user roles updated successfully!");
    console.log(`   New Roles: ${JSON.stringify(roles)}`);
    console.log("");

    // Verify the update
    const { data: updatedAdminUser, error: verifyError } = await supabase
      .from('admin_users')
      .select('roles')
      .eq('id', adminUser.id)
      .single();

    if (verifyError || !updatedAdminUser) {
      console.error("❌ Error verifying update:", verifyError);
      process.exit(1);
    }

    console.log("🔍 Verification:");
    console.log(`   Roles: ${JSON.stringify(updatedAdminUser.roles)}`);
    console.log("");

    console.log("✅ Admin user roles have been fixed!");
    console.log("You should now be able to log in to the admin dashboard.");
    
  } catch (error) {
    console.error("❌ Error fixing admin user roles:", error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2] || "eloityhq@gmail.com";

if (!email) {
  console.error("❌ Email is required");
  console.log("Usage: npm run fix-admin-user-roles <email>");
  process.exit(1);
}

fixAdminUserRoles(email).catch(console.error);