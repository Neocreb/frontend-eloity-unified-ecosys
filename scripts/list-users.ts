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

async function listUsers() {
  console.log("🚀 Fetching users from Supabase with service role...\n");

  try {
    // Fetch users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error("❌ Error fetching users:", error);
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.log("No users found in the database.");
      return;
    }

    console.log("📋 Found users:");
    console.log("================");
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.full_name || 'No name'})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.created_at}`);
      console.log("");
    });

    console.log(`Total users: ${users.length}`);
    
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    process.exit(1);
  }
}

listUsers().catch(console.error);