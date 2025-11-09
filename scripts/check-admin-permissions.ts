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

async function checkAdminPermissions(userId: string) {
  console.log(`🚀 Checking admin permissions for user: ${userId}\n`);

  try {
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error(`❌ User with ID ${userId} not found`);
      process.exit(1);
    }

    console.log(`👤 User: ${user.email} (${user.full_name || 'No name'})`);

    // Check user's admin permissions
    const { data: permissions, error: permissionError } = await supabase
      .from('admin_permissions')
      .select('*')
      .eq('user_id', userId);

    if (permissionError) {
      console.error("❌ Error fetching admin permissions:", permissionError);
      process.exit(1);
    }

    if (!permissions || permissions.length === 0) {
      console.log("⚠️  User has no admin permissions");
      return;
    }

    console.log(`\n📋 Admin Permissions:`);
    console.log("====================");
    permissions.forEach((permission, index) => {
      console.log(`${index + 1}. Role: ${permission.role}`);
      console.log(`   Active: ${permission.is_active ? 'Yes' : 'No'}`);
      console.log(`   Granted by: ${permission.granted_by}`);
      console.log(`   Created: ${permission.created_at}`);
      if (permission.expires_at) {
        console.log(`   Expires: ${permission.expires_at}`);
      }
      console.log(`   Permissions: ${permission.permissions.join(', ')}`);
      console.log("");
    });

    console.log(`Total permissions: ${permissions.length}`);
    
  } catch (error) {
    console.error("❌ Error checking admin permissions:", error);
    process.exit(1);
  }
}

// Get user ID from command line arguments
const userId = process.argv[2] || "4211e864-4051-4404-b8b7-60d937b8631c";

if (!userId) {
  console.error("❌ User ID is required");
  console.log("Usage: npm run check-admin-permissions <user-id>");
  process.exit(1);
}

checkAdminPermissions(userId).catch(console.error);