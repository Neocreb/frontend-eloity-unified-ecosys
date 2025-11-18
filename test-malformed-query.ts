import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

// Check if environment variables are loaded
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.error('❌ Environment variables are missing');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

console.log('✅ Supabase client created successfully');

async function testMalformedQuery() {
  try {
    console.log("Testing potential malformed query scenarios...");
    
    // Test the specific scenario from the error
    console.log("\nTest 1: Testing neq query with valid UUID");
    const validUserId = '4211e864-4051-4404-b8b7-60d937b8631c'; // From the error message
    const { data: neqData, error: neqError } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', validUserId)
      .limit(5);
      
    if (neqError) {
      console.error("❌ neq query failed:", neqError.message);
    } else {
      console.log("✅ neq query successful");
      console.log("Found", neqData.length, "profiles");
    }
    
    // Test ordering scenarios
    console.log("\nTest 2: Testing various order scenarios");
    
    // Test 1: Basic ordering
    const { data: orderData1, error: orderError1 } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
      
    if (orderError1) {
      console.error("❌ Basic order failed:", orderError1.message);
    } else {
      console.log("✅ Basic order successful");
    }
    
    // Test 2: Ordering with other conditions
    const { data: orderData2, error: orderError2 } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', validUserId)
      .order('created_at', { ascending: false })
      .limit(3);
      
    if (orderError2) {
      console.error("❌ Order with neq failed:", orderError2.message);
    } else {
      console.log("✅ Order with neq successful");
    }
    
    console.log("\nMalformed query tests completed");
  } catch (error) {
    console.error("Unexpected error in malformed query test:", error);
  }
}

testMalformedQuery();