#!/usr/bin/env npx tsx

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env.local
config({ path: '.env.local' });

async function createNewAdmin() {
  console.log("🚀 Create New Admin User Utility\n");

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Supabase URL and Service Role Key are required");
      process.exit(1);
    }

    // Create Supabase client with service role key (to bypass RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const email = "eloityhq@gmail.com";

    // First, check if the user exists
    console.log(`🔍 Checking if user exists: ${email}`);
    
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email, role, is_verified')
      .eq('email', email)
      .single();

    let userId;
    
    if (existingUser && !userError) {
      console.log("✅ User found:");
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   Is Verified: ${existingUser.is_verified}`);
      userId = existingUser.id;
      
      // Update the user's role and verification status if needed
      if (existingUser.role !== 'admin' || !existingUser.is_verified) {
        console.log("🔄 Updating user role and verification status...");
        const { error: updateError } = await supabase
          .from('users')
          .update({
            role: 'admin',
            is_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id);

        if (updateError) {
          console.error("❌ Failed to update user:", updateError.message);
          process.exit(1);
        }
        console.log("✅ User updated successfully!");
      } else {
        console.log("✅ User already has correct role and verification status");
      }
    } else {
      console.log("❌ User not found. This script only works with existing users.");
      console.log("💡 Please create the user first through the registration process,");
      console.log("   or use the eloityhq@gmail.com user which already exists.");
      process.exit(1);
    }

    // Check if admin permissions already exist
    console.log("\n🔍 Checking if admin permissions exist...");
    
    const { data: existingPermissions, error: permissionsError } = await supabase
      .from('admin_permissions')
      .select('id, role, is_active')
      .eq('user_id', userId);

    if (existingPermissions && existingPermissions.length > 0 && !permissionsError) {
      console.log("✅ Admin permissions already exist:");
      existingPermissions.forEach((perm, index) => {
        console.log(`   ${index + 1}. Role: ${perm.role}, Active: ${perm.is_active}`);
      });
      
      // Check if super_admin role exists
      const hasSuperAdmin = existingPermissions.some(perm => perm.role === 'super_admin' && perm.is_active);
      if (hasSuperAdmin) {
        console.log("✅ User already has active super_admin permissions");
      } else {
        console.log("⚠️  User doesn't have active super_admin permissions");
        console.log("💡 You may need to grant super_admin permissions manually");
      }
    } else {
      // Create admin permissions
      console.log("🛡️  Creating admin permissions...");
      const { error: permissionError } = await supabase
        .from('admin_permissions')
        .insert([
          {
            user_id: userId,
            role: 'super_admin',
            permissions: [
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
              "system.all"
            ],
            is_active: true,
            granted_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (permissionError) {
        console.error("❌ Failed to create admin permissions:", permissionError.message);
        process.exit(1);
      } else {
        console.log("✅ Admin permissions created successfully!");
      }
    }

    console.log("\n✅ Admin user setup completed!");
    console.log("\n📝 Login credentials:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: [use the password you set during registration]`);
    console.log("\n💡 If you don't know the password, you'll need to reset it through");
    console.log("   the Supabase Auth interface or create a new user with a known password.");
    
  } catch (error) {
    console.error("❌ Error in admin user setup:", error);
    process.exit(1);
  }
}

createNewAdmin().catch(console.error);