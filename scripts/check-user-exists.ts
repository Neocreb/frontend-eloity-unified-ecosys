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

async function checkUserExists(email: string) {
  console.log(`🚀 Checking if user exists with email: ${email}\n`);

  try {
    // List all users to see what's in the database
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_verified');

    if (allUsersError) {
      console.error("❌ Error fetching users:", allUsersError);
      process.exit(1);
    }

    console.log(`📋 Found ${allUsers.length} users in the database:`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.id}) - Role: ${user.role || 'Not set'}, Verified: ${user.is_verified ? 'Yes' : 'No'}`);
    });

    console.log("");

    // Check specifically for our user
    const user = allUsers.find(u => u.email === email);
    
    if (!user) {
      console.log(`❌ User with email ${email} not found in users table`);
      console.log("Available emails:");
      allUsers.forEach(u => console.log(`   - ${u.email}`));
      return;
    }

    console.log(`✅ User found:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role || 'Not set'}`);
    console.log(`   Is Verified: ${user.is_verified ? 'Yes' : 'No'}`);
    console.log("");

    // Check if user exists in admin_users table
    const { data: adminUser, error: adminUserError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id);

    if (adminUserError) {
      console.error("❌ Error fetching admin user:", adminUserError);
    } else if (!adminUser || adminUser.length === 0) {
      console.log("⚠️  User not found in admin_users table");
    } else {
      console.log("✅ User found in admin_users table:");
      adminUser.forEach((au, index) => {
        console.log(`${index + 1}. ID: ${au.id}`);
        console.log(`   Name: ${au.name}`);
        console.log(`   Roles: ${au.roles ? JSON.stringify(au.roles) : '[]'}`);
        console.log(`   Permissions: ${au.permissions ? JSON.stringify(au.permissions) : '[]'}`);
        console.log(`   Is Active: ${au.is_active ? 'Yes' : 'No'}`);
        console.log("");
      });
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

  } catch (error) {
    console.error("❌ Error checking user:", error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2] || "eloityhq@gmail.com";

checkUserExists(email).catch(console.error);