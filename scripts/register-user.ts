#!/usr/bin/env npx tsx

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

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

async function registerUser() {
  console.log("🚀 Creating new user directly in database with service role...\n");

  try {
    // User details
    const userId = uuidv4();
    const email = "admin@example.com";
    const fullName = "Admin User";

    // Insert user directly into the database
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email: email,
          full_name: fullName,
          role: "admin",
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) {
      console.error("❌ Error creating user:", error.message);
      process.exit(1);
    }

    console.log(`✅ User created successfully!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🆔 User ID: ${userId}`);
    console.log(`👤 Full Name: ${fullName}`);
    console.log("");

    console.log("\n📝 Next steps:");
    console.log("1. Use this user ID to grant super admin privileges:");
    console.log(`   npx tsx scripts/grant-super-admin.ts ${userId}`);
    console.log("2. You'll need to set up authentication separately for this user");
    
  } catch (error) {
    console.error("❌ Error creating user:", error);
    process.exit(1);
  }
}

registerUser().catch(console.error);