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

async function testAdminAuth(email: string) {
  console.log(`🚀 Testing admin authentication for email: ${email}\n`);

  try {
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_verified')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`👤 User found:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role || 'Not set'}`);
    console.log(`   Is Verified: ${user.is_verified ? 'Yes' : 'No'}`);
    console.log("");

    // Check if user has admin permissions
    const { data: permissions, error: permissionError } = await supabase
      .from('admin_permissions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (permissionError) {
      console.error("❌ Error fetching admin permissions:", permissionError);
      process.exit(1);
    }

    if (!permissions || permissions.length === 0) {
      console.log("❌ User has no active admin permissions");
      return;
    }

    console.log(`📋 Active Admin Permissions:`);
    console.log("========================");
    permissions.forEach((permission, index) => {
      console.log(`${index + 1}. Role: ${permission.role}`);
      console.log(`   Permissions: [${permission.permissions.length} permissions]`);
      console.log(`   Granted by: ${permission.granted_by}`);
      console.log("");
    });

    // Check for super_admin role specifically
    const superAdminPermission = permissions.find(
      perm => perm.role === 'super_admin'
    );

    if (superAdminPermission) {
      console.log("✅ User has active super_admin permissions");
    } else {
      console.log("❌ User does not have active super_admin permissions");
    }

    // Check if user is in the admins table
    const { data: adminUser, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (adminError) {
      console.log("⚠️  User not found in admins table (might be normal if using only admin_permissions)");
    } else {
      console.log("✅ User found in admins table");
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Active: ${adminUser.is_active ? 'Yes' : 'No'}`);
    }

    console.log("\n📝 Summary:");
    console.log(`   User Role: ${user.role}`);
    console.log(`   Is Verified: ${user.is_verified ? 'Yes' : 'No'}`);
    console.log(`   Has Super Admin Permissions: ${superAdminPermission ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error("❌ Error testing admin auth:", error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2] || "eloityhq@gmail.com";

if (!email) {
  console.error("❌ Email is required");
  console.log("Usage: npm run test-admin-auth <email>");
  process.exit(1);
}

testAdminAuth(email).catch(console.error);