#!/usr/bin/env npx tsx

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

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

    const email = "admin@eloity.com";
    const password = "Eloity2024!";
    const fullName = "System Administrator";

    console.log(`👤 Creating new admin user:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log("");

    // Hash the password
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user in the users table
    console.log("🔄 Creating user in database...");
    const userId = randomUUID();
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email: email,
          full_name: fullName,
          role: 'admin',
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (userError) {
      // Check if user already exists
      const { data: existingUser, error: existingUserError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser && !existingUserError) {
        console.log("⚠️  User already exists, updating role and verification status...");
        const { error: updateError } = await supabase
          .from('users')
          .update({
            role: 'admin',
            is_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id);

        if (updateError) {
          console.error("❌ Failed to update existing user:", updateError.message);
          process.exit(1);
        }

        console.log("✅ Existing user updated successfully!");
      } else {
        console.error("❌ Failed to create user:", userError.message);
        process.exit(1);
      }
    } else {
      console.log("✅ User created successfully!");
    }

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
      // Check if permissions already exist
      const { data: existingPermissions, error: existingPermissionsError } = await supabase
        .from('admin_permissions')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingPermissions && !existingPermissionsError) {
        console.log("⚠️  Admin permissions already exist");
      } else {
        console.error("❌ Failed to create admin permissions:", permissionError.message);
        process.exit(1);
      }
    } else {
      console.log("✅ Admin permissions created successfully!");
    }

    console.log("\n✅ New admin user created successfully!");
    console.log("\n📝 Login credentials:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log("\n🌐 Access admin dashboard at: /admin/login");
    console.log("\n💡 After logging in, you should change this password to a more secure one.");
    
  } catch (error) {
    console.error("❌ Error creating new admin user:", error);
    process.exit(1);
  }
}

createNewAdmin().catch(console.error);