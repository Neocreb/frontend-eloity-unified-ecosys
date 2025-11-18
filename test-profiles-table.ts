import { supabase } from "@/integrations/supabase/client";

async function testProfilesTable() {
  try {
    console.log("Testing profiles table access...");
    
    // Test if profiles table exists by trying to select from it
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1);
      
    if (error) {
      console.error("Error accessing profiles table:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      return;
    }
    
    console.log("Profiles table exists and is accessible");
    console.log("Sample data:", data);
    
    // Test if we can get the current user's profile
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error getting current user:", userError);
      return;
    }
    
    if (userData?.user) {
      console.log("Current user ID:", userData.user.id);
      
      // Try to get the current user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();
        
      if (profileError) {
        console.error("Error getting user profile:", profileError);
      } else {
        console.log("User profile:", profileData);
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

testProfilesTable();