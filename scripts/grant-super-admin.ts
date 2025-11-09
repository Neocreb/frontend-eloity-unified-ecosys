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

async function grantSuperAdmin(userId: string) {
  console.log(`🚀 Granting super admin privileges to user: ${userId}\n`);

  try {
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error(`❌ User with ID ${userId} not found`);
      console.log("\nTo grant super admin privileges, you need to provide a valid user ID.");
      console.log("You can find user IDs by:");
      console.log("1. Checking the users table in your Supabase dashboard");
      console.log("2. Looking at the user management section in your admin panel");
      console.log("3. Using a valid user ID from your application");
      process.exit(1);
    }

    console.log(`👤 Found user: ${user.email} (${user.full_name || 'No name'})`);

    // Check if user already has super admin role
    const { data: existingPermissions, error: permissionError } = await supabase
      .from('admin_permissions')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'super_admin');

    if (!permissionError && existingPermissions && existingPermissions.length > 0) {
      console.log("⚠️  User already has super admin privileges");
      process.exit(0);
    }

    // Grant super admin role
    const permissions = [
      "admin.all",
      "users.all",
      "content.all",
      "marketplace.all",
      "crypto.all",
      "freelance.all",
      "financial.all",
      "settings.all",
      "moderation.all",
      "analytics.all",
      "system.all",
    ];

    const { data, error } = await supabase
      .from('admin_permissions')
      .insert([{
        user_id: userId,
        role: 'super_admin',
        permissions: permissions,
        is_active: true,
        granted_by: userId,
      }])
      .select();

    if (error) {
      console.error("❌ Error granting super admin privileges:", error);
      process.exit(1);
    }

    console.log("✅ Super admin privileges granted successfully!");
    console.log("\n🌐 Access admin dashboard at: /admin/login");
    
  } catch (error) {
    console.error("❌ Error granting super admin privileges:", error);
    process.exit(1);
  }
}

// Get user ID from command line arguments
const userId = process.argv[2] || "4211e864-4051-4404-b8b7-60d937b8631c";

if (!userId) {
  console.error("❌ User ID is required");
  console.log("Usage: npm run grant-super-admin <user-id>");
  process.exit(1);
}

grantSuperAdmin(userId).catch(console.error);