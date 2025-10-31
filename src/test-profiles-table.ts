import { supabase } from "@/integrations/supabase/client";

async function testProfilesTable() {
  console.log("Testing if profiles table exists...");
  
  try {
    // Try to fetch from the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1);

    if (error) {
      console.error("Error accessing profiles table:", error);
      return false;
    }
    
    console.log("Profiles table exists and is accessible");
    return true;
  } catch (err) {
    console.error("Error testing profiles table:", err);
    return false;
  }
}

// Run the test
testProfilesTable().then(exists => {
  console.log("Profiles table exists:", exists);
});