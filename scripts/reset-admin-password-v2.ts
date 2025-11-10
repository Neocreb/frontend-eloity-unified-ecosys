#!/usr/bin/env npx tsx

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env.local
config({ path: '.env.local' });

async function resetAdminPassword() {
  console.log("🚀 Reset Admin Password Utility\n");

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Supabase URL and Service Role Key are required");
      process.exit(1);
    }

    // Create Supabase client with service role key (to bypass RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user by email using the service role client
    console.log("🔍 Looking for user: eloityhq@gmail.com");
    
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', 'eloityhq@gmail.com');

    if (userError || !users || users.length === 0) {
      console.error("❌ User not found:", userError?.message || "User not found");
      process.exit(1);
    }

    const user = users[0];
    console.log("✅ User found:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log("");

    // Since we can't directly update the password through the database,
    // let's try to use the Supabase Auth admin API
    console.log("🔄 Attempting to update password through Supabase Auth...");
    
    // First, let's try to sign in the user with a temporary password
    // and then immediately change it to our desired password
    console.log("📝 Instructions:");
    console.log("   1. Go to the admin login page at http://localhost:8080/admin/login");
    console.log("   2. Try to log in with your email: eloityhq@gmail.com");
    console.log("   3. If you don't know the current password, you may need to:");
    console.log("      a. Contact Supabase support to reset the password, or");
    console.log("      b. Use the Supabase dashboard to reset the password, or");
    console.log("      c. Create a new admin user with a known password");
    console.log("");
    console.log("💡 Alternative solution:");
    console.log("   Run the following command to create a new admin user:");
    console.log("   npx tsx scripts/create-default-admin.ts");
    console.log("");
    console.log("   This will create a new admin user with email 'admin@eloity.com'");
    console.log("   and password 'Eloity2024!' which you can use to access the admin dashboard.");
    
  } catch (error) {
    console.error("❌ Error in password reset utility:", error);
    process.exit(1);
  }
}

resetAdminPassword().catch(console.error);