#!/usr/bin/env npx tsx

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env.local
config({ path: '.env.local' });

async function ensureAdminPermissions() {
  console.log("🚀 Ensure Admin Permissions Utility\n");

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

    // First, get the user ID
    console.log(`🔍 Getting user ID for: ${email}`);
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, role, is_verified')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.error("❌ User not found:", userError?.message || "User not found");
      process.exit(1);
    }

    console.log("✅ User found:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Is Verified: ${user.is_verified}`);
    console.log("");

    // Update user role and verification if needed
    if (user.role !== 'admin' || !user.is_verified) {
      console.log("🔄 Updating user role and verification status...");
      const { error: updateError } = await supabase
        .from('users')
        .update({
          role: 'admin',
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error("❌ Failed to update user:", updateError.message);
        process.exit(1);
      }
      console.log("✅ User updated successfully!");
    } else {
      console.log("✅ User already has correct role and verification status");
    }

    // Check if admin permissions already exist
    console.log("\n🔍 Checking if admin permissions exist...");
    
    const { data: existingPermissions, error: permissionsError } = await supabase
      .from('admin_permissions')
      .select('id, role, is_active, permissions')
      .eq('user_id', user.id);

    if (existingPermissions && existingPermissions.length > 0 && !permissionsError) {
      console.log("✅ Admin permissions found:");
      existingPermissions.forEach((perm, index) => {
        console.log(`   ${index + 1}. Role: ${perm.role}, Active: ${perm.is_active}`);
        console.log(`      Permissions: ${perm.permissions.length} permissions`);
      });
      
      // Check if super_admin role exists and is active
      const superAdminPermission = existingPermissions.find(perm => perm.role === 'super_admin' && perm.is_active);
      if (superAdminPermission) {
        console.log("\n✅ User already has active super_admin permissions with all required permissions");
      } else {
        console.log("\n⚠️  User doesn't have active super_admin permissions");
        console.log("🔄 Creating active super_admin permissions...");
        
        // Create or update super_admin permissions
        const { error: permissionError } = await supabase
          .from('admin_permissions')
          .upsert([
            {
              user_id: user.id,
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
              granted_by: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ], {
            onConflict: 'user_id,role'
          });

        if (permissionError) {
          console.error("❌ Failed to create/update admin permissions:", permissionError.message);
          process.exit(1);
        }
        console.log("✅ Super admin permissions created/updated successfully!");
      }
    } else {
      // Create admin permissions
      console.log("🛡️  Creating admin permissions...");
      const { error: permissionError } = await supabase
        .from('admin_permissions')
        .insert([
          {
            user_id: user.id,
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
            granted_by: user.id,
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

    // Also check and update admin_users table if it exists
    console.log("\n🔍 Checking admin_users table...");
    
    const { data: adminUsers, error: adminUsersError } = await supabase
      .from('admin_users')
      .select('id, user_id, roles, is_active')
      .eq('user_id', user.id);

    if (adminUsers && adminUsers.length > 0 && !adminUsersError) {
      console.log("✅ Admin user record found in admin_users table:");
      adminUsers.forEach((adminUser, index) => {
        console.log(`   ${index + 1}. ID: ${adminUser.id}`);
        console.log(`      Roles: ${JSON.stringify(adminUser.roles)}`);
        console.log(`      Active: ${adminUser.is_active}`);
      });
      
      // Update roles if needed
      const needsRoleUpdate = adminUsers.some(adminUser => 
        !adminUser.roles || !adminUser.roles.includes('super_admin')
      );
      
      if (needsRoleUpdate) {
        console.log("🔄 Updating admin user roles...");
        for (const adminUser of adminUsers) {
          const roles = adminUser.roles || [];
          if (!roles.includes('super_admin')) {
            roles.push('super_admin');
            const { error: updateError } = await supabase
              .from('admin_users')
              .update({
                roles: roles,
                updated_at: new Date().toISOString()
              })
              .eq('id', adminUser.id);

            if (updateError) {
              console.error("❌ Failed to update admin user roles:", updateError.message);
            } else {
              console.log("✅ Admin user roles updated successfully!");
            }
          }
        }
      } else {
        console.log("✅ Admin user already has correct roles");
      }
    } else if (!adminUsersError) {
      console.log("⚠️  No admin user record found in admin_users table");
      console.log("💡 This may be normal if the system only uses admin_permissions table");
    } else {
      console.log("⚠️  admin_users table may not exist or is not accessible");
    }

    console.log("\n✅ Admin permissions verification completed!");
    console.log("\n📝 Summary:");
    console.log(`   User Email: ${user.email}`);
    console.log(`   User Role: admin`);
    console.log(`   Is Verified: true`);
    console.log(`   Has Super Admin Permissions: true`);
    console.log("\n💡 To access the admin dashboard:");
    console.log("   1. Go to http://localhost:8080/admin/login");
    console.log("   2. Log in with your email: eloityhq@gmail.com");
    console.log("   3. Use your current password (if you know it)");
    console.log("   4. If you don't know the password, you'll need to reset it through");
    console.log("      the Supabase dashboard or contact Supabase support");
    
  } catch (error) {
    console.error("❌ Error ensuring admin permissions:", error);
    process.exit(1);
  }
}

ensureAdminPermissions().catch(console.error);