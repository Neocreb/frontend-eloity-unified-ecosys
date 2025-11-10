#!/usr/bin/env npx tsx

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env.local
config({ path: '.env.local' });

async function createAuthUser() {
  console.log("🚀 Create Auth User Utility\n");

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

    console.log(`👤 Creating new auth user:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log("");

    // Create the user using Supabase Auth admin API
    console.log("🔄 Creating user through Supabase Auth...");
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });

    if (error) {
      console.error("❌ Failed to create auth user:", error.message);
      process.exit(1);
    }

    console.log("✅ Auth user created successfully!");
    console.log(`   User ID: ${data.user.id}`);
    console.log(`   Email: ${data.user.email}`);
    console.log(`   Email Confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);
    
    // Now create the user record in the users table
    console.log("\n🔄 Creating user record in database...");
    
    const { error: dbError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          email: email,
          full_name: "System Administrator",
          role: 'admin',
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

    if (dbError) {
      // Check if user already exists
      const { data: existingUser, error: existingUserError } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (existingUser && !existingUserError) {
        console.log("⚠️  User record already exists in database");
        
        // Update the user's role and verification status
        console.log("🔄 Updating user role and verification status...");
        const { error: updateError } = await supabase
          .from('users')
          .update({
            role: 'admin',
            is_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user.id);

        if (updateError) {
          console.error("❌ Failed to update user:", updateError.message);
          process.exit(1);
        }
        console.log("✅ User record updated successfully!");
      } else {
        console.error("❌ Failed to create user record:", dbError.message);
        process.exit(1);
      }
    } else {
      console.log("✅ User record created successfully!");
    }

    // Create admin permissions
    console.log("\n🛡️  Creating admin permissions...");
    const { error: permissionError } = await supabase
      .from('admin_permissions')
      .insert([
        {
          user_id: data.user.id,
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
          granted_by: data.user.id,
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

    console.log("\n✅ New admin user created successfully!");
    console.log("\n📝 Login credentials:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log("\n🌐 Access admin dashboard at: /admin/login");
    console.log("\n💡 After logging in, you should change this password to a more secure one.");
    
  } catch (error) {
    console.error("❌ Error creating auth user:", error);
    process.exit(1);
  }
}

createAuthUser().catch(console.error);