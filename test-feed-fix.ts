import { supabase } from "@/integrations/supabase/client";
import { PostService } from "@/services/postService";
import { UserService } from "@/services/userService";

async function testFeedFix() {
  try {
    console.log("Testing feed fix...");
    
    // Test if we can access the profiles table
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1);
      
    if (profilesError) {
      console.error("Error accessing profiles table:", profilesError);
      console.error("Error code:", profilesError.code);
      console.error("Error message:", profilesError.message);
    } else {
      console.log("Profiles table is accessible");
      console.log("Sample profiles data:", profilesData);
    }
    
    // Test if we can get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error getting current user:", userError);
    } else if (userData?.user) {
      console.log("Current user ID:", userData.user.id);
      
      // Test fetching feed posts
      try {
        console.log("Testing PostService.getFeedPosts...");
        const feedPosts = await PostService.getFeedPosts(userData.user.id, 5, 0);
        console.log("Feed posts fetched successfully:", feedPosts.length, "posts");
        
        if (feedPosts.length > 0) {
          console.log("First post:", {
            id: feedPosts[0].id,
            author: feedPosts[0].author?.username || 'Unknown',
            content: feedPosts[0].content?.substring(0, 50) + '...'
          });
        }
      } catch (postError) {
        console.error("Error fetching feed posts:", postError);
      }
      
      // Test fetching user by ID
      try {
        console.log("Testing UserService.getUserById...");
        const userProfile = await UserService.getUserById(userData.user.id);
        console.log("User profile fetched successfully:", userProfile?.username);
      } catch (userProfileError) {
        console.error("Error fetching user profile:", userProfileError);
      }
    } else {
      console.log("No authenticated user found");
    }
  } catch (error) {
    console.error("Unexpected error in testFeedFix:", error);
  }
}

testFeedFix();