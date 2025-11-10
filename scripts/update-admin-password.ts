#!/usr/bin/env npx tsx

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

// Load environment variables from .env.local
config({ path: '.env.local' });

async function updateAdminPassword() {
  console.log("🚀 Update Admin Password Utility\n");

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Supabase URL and Service Role Key are required");
      process.exit(1);
    }

    // Create Supabase client with service role key (to bypass RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user by email
    console.log("🔍 Looking for user: eloityhq@gmail.com");
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', 'eloityhq@gmail.com')
      .single();

    if (userError || !user) {
      console.error("❌ User not found:", userError?.message || "User not found");
      process.exit(1);
    }

    console.log("✅ User found:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log("");

    // Hash the new password
    const newPassword = "Pass123";
    console.log(`🔐 Hashing new password: ${newPassword}`);
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update the user's password
    console.log("🔄 Updating password...");
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error("❌ Failed to update password:", updateError.message);
      process.exit(1);
    }

    console.log("✅ Password updated successfully!");
    console.log("");
    console.log("📝 Login credentials:");
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${newPassword}`);
    console.log("");
    console.log("💡 After logging in, you should change this password to a more secure one.");
    console.log("   You can do this through the admin dashboard profile settings.");
    
  } catch (error) {
    console.error("❌ Error updating admin password:", error);
    process.exit(1);
  }
}

updateAdminPassword().catch(console.error);