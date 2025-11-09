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

async function fixAdminUser(email: string) {
  console.log(`🚀 Fixing admin user: ${email}\n`);

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

    // Update user to have admin role and be verified
    const { error: updateError } = await supabase
      .from('users')
      .update({
        role: 'admin',
        is_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error("❌ Error updating user:", updateError);
      process.exit(1);
    }

    console.log("✅ User updated successfully!");
    console.log("   Role set to: admin");
    console.log("   Is Verified set to: true");
    console.log("");

    // Verify the update
    const { data: updatedUser, error: fetchError } = await supabase
      .from('users')
      .select('role, is_verified')
      .eq('id', user.id)
      .single();

    if (fetchError || !updatedUser) {
      console.error("❌ Error verifying update:", fetchError);
      process.exit(1);
    }

    console.log("🔍 Verification:");
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   Is Verified: ${updatedUser.is_verified ? 'Yes' : 'No'}`);
    console.log("");

    console.log("✅ User is now properly configured for admin access!");
    console.log("You should be able to log in to the admin dashboard now.");
    
  } catch (error) {
    console.error("❌ Error fixing admin user:", error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2] || "eloityhq@gmail.com";

if (!email) {
  console.error("❌ Email is required");
  console.log("Usage: npm run fix-admin-user <email>");
  process.exit(1);
}

fixAdminUser(email).catch(console.error);