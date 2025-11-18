import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

// Check if environment variables are loaded
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.error('❌ Environment variables are missing');
  console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', process.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

console.log('✅ Supabase client created successfully');

async function testRLSPolicies() {
  try {
    console.log("Testing RLS policies on profiles table...");
    
    // Test 1: Check if we can access profiles table with basic select
    console.log("Test 1: Basic select from profiles table");
    const { data: basicData, error: basicError } = await supabase
      .from('profiles')
      .select('user_id, username, full_name')
      .limit(3);
      
    if (basicError) {
      console.error("❌ Basic select failed:", basicError.message);
      console.error("Error details:", basicError);
    } else {
      console.log("✅ Basic select successful");
      console.log("Data:", basicData);
    }
    
    // Test 2: Check if we can access the current user's profile
    console.log("\nTest 2: Access current user's profile");
    const { data: currentUser, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("❌ Auth error:", authError.message);
    } else if (currentUser?.user) {
      console.log("Current user ID:", currentUser.user.id);
      
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUser.user.id)
        .single();
        
      if (profileError) {
        console.error("❌ User profile access failed:", profileError.message);
        console.error("Error details:", profileError);
      } else {
        console.log("✅ User profile access successful");
        console.log("Profile:", {
          user_id: userProfile.user_id,
          username: userProfile.username,
          full_name: userProfile.full_name
        });
      }
    } else {
      console.log("No authenticated user");
    }
    
    // Test 3: Try to access profiles with a complex query that might cause issues
    console.log("\nTest 3: Complex query test");
    const { data: complexData, error: complexError } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', 'non-existent-user-id')
      .limit(5);
      
    if (complexError) {
      console.error("❌ Complex query failed:", complexError.message);
      console.error("Error details:", complexError);
    } else {
      console.log("✅ Complex query successful");
      console.log("Found", complexData.length, "profiles");
    }
    
    console.log("\nRLS policy tests completed");
  } catch (error) {
    console.error("Unexpected error in RLS policy test:", error);
  }
}

testRLSPolicies();