#!/usr/bin/env npx tsx

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fetch from 'node-fetch';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function testApiEndpoint() {
  console.log("🚀 Testing API endpoint\n");

  try {
    // Test the health endpoint
    console.log("🔍 Testing /api/health endpoint...");
    const healthResponse = await fetch('http://localhost:5000/api/health');
    console.log(`   Status: ${healthResponse.status} ${healthResponse.statusText}`);
    console.log(`   Content-Type: ${healthResponse.headers.get('content-type')}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log(`   Response: ${JSON.stringify(healthData, null, 2)}`);
    }
    console.log("");

    // Get user ID for eloityhq@gmail.com
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Supabase URL and Service Role Key are required");
      process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'eloityhq@gmail.com')
      .single();

    if (userError || !user) {
      console.error("❌ User not found:", userError?.message || "User not found");
      process.exit(1);
    }

    console.log(`👤 Testing /api/admin/users/${user.id} endpoint...`);
    
    // Test the admin user endpoint
    const adminUserResponse = await fetch(`http://localhost:5000/api/admin/users/${user.id}`);
    console.log(`   Status: ${adminUserResponse.status} ${adminUserResponse.statusText}`);
    console.log(`   Content-Type: ${adminUserResponse.headers.get('content-type')}`);
    
    if (adminUserResponse.ok) {
      const adminUserData = await adminUserResponse.json();
      console.log(`   Response: ${JSON.stringify(adminUserData, null, 2)}`);
    } else {
      const errorText = await adminUserResponse.text();
      console.log(`   Error Response: ${errorText}`);
    }
    
  } catch (error) {
    console.error("❌ Error testing API endpoint:", error);
    process.exit(1);
  }
}

testApiEndpoint().catch(console.error);