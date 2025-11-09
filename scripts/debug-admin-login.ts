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

async function debugAdminLogin(email: string) {
  console.log(`🚀 Debugging admin login for email: ${email}\n`);

  try {
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`👤 User found:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Full Name: ${user.full_name || 'Not set'}`);
    console.log(`   Role: ${user.role || 'Not set'}`);
    console.log(`   Is Verified: ${user.is_verified ? 'Yes' : 'No'}`);
    console.log(`   Created At: ${user.created_at}`);
    console.log(`   Updated At: ${user.updated_at}`);
    console.log("");

    // Check user's admin permissions
    const { data: permissions, error: permissionError } = await supabase
      .from('admin_permissions')
      .select('*')
      .eq('user_id', user.id);

    if (permissionError) {
      console.error("❌ Error fetching admin permissions:", permissionError);
      process.exit(1);
    }

    if (!permissions || permissions.length === 0) {
      console.log("⚠️  User has no admin permissions");
      return;
    }

    console.log(`📋 Admin Permissions:`);
    console.log("====================");
    permissions.forEach((permission, index) => {
      console.log(`${index + 1}. Role: ${permission.role}`);
      console.log(`   Active: ${permission.is_active ? 'Yes' : 'No'}`);
      console.log(`   Granted by: ${permission.granted_by}`);
      console.log(`   Created: ${permission.created_at}`);
      if (permission.expires_at) {
        console.log(`   Expires: ${permission.expires_at}`);
      }
      console.log(`   Permissions: [${permission.permissions.length} permissions]`);
      console.log("");
    });

    // Check for active super_admin role specifically
    const superAdminPermission = permissions.find(
      perm => perm.role === 'super_admin' && perm.is_active === true
    );

    if (superAdminPermission) {
      console.log("✅ User has active super_admin permissions");
    } else {
      console.log("❌ User does not have active super_admin permissions");
    }

    console.log("\n📝 Next steps:");
    console.log("1. If the user should have admin access but doesn't, try granting permissions again");
    console.log("2. Check if there are any issues with the authentication flow");
    console.log("3. Verify that the admin dashboard is correctly checking permissions");
    
  } catch (error) {
    console.error("❌ Error debugging admin login:", error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2] || "eloityhq@gmail.com";

if (!email) {
  console.error("❌ Email is required");
  console.log("Usage: npm run debug-admin-login <email>");
  process.exit(1);
}

debugAdminLogin(email).catch(console.error);