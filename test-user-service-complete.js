// Comprehensive test of UserService with real Supabase connection
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing UserService with real Supabase connection...');

// Connect to Supabase
try {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('✅ Connected to Supabase');

  // Import UserService
  const { UserService } = await import('./src/services/userService.ts');

  // Test creating a user
  console.log('Testing user creation...');
  
  // Generate a random user ID for testing
  const testUserId = 'test-user-' + Date.now();
  
  // Create user in users table
  const userData = {
    id: testUserId,
    email: `test${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    full_name: 'Test User',
    bio: 'This is a test user for UserService testing',
    is_verified: true,
    points: 100,
    level: 'gold'
  };
  
  const createdUser = await UserService.createOrUpdateUser(userData);
  
  if (createdUser) {
    console.log('✅ User created successfully in users table');
    console.log('User data:', createdUser);
  } else {
    console.log('❌ Failed to create user in users table');
  }

  // Test getting user by ID
  console.log('Testing getUserById...');
  const userById = await UserService.getUserById(testUserId);
  
  if (userById) {
    console.log('✅ Successfully retrieved user by ID');
    console.log('User ID:', userById.id);
    console.log('Username:', userById.username);
    console.log('Full name:', userById.full_name);
  } else {
    console.log('❌ Failed to retrieve user by ID');
  }

  // Test getting user by username
  console.log('Testing getUserByUsername...');
  const userByUsername = await UserService.getUserByUsername(userData.username);
  
  if (userByUsername) {
    console.log('✅ Successfully retrieved user by username');
    console.log('User ID:', userByUsername.id);
    console.log('Username:', userByUsername.username);
    console.log('Full name:', userByUsername.full_name);
  } else {
    console.log('❌ Failed to retrieve user by username');
  }

  // Test updating user profile
  console.log('Testing updateUserProfile...');
  
  const profileUpdate = {
    bio: 'This is an updated test user bio',
    points: 200
  };
  
  const updatedProfile = await UserService.updateUserProfile(testUserId, profileUpdate);
  
  if (updatedProfile) {
    console.log('✅ User profile updated successfully');
    console.log('Updated bio:', updatedProfile.bio);
    console.log('Updated points:', updatedProfile.points);
  } else {
    console.log('❌ Failed to update user profile');
  }

  // Test searching users
  console.log('Testing searchUsers...');
  const searchResults = await UserService.searchUsers('test');
  
  if (searchResults.length > 0) {
    console.log('✅ User search successful');
    console.log(`Found ${searchResults.length} users`);
    console.log('First result username:', searchResults[0].username);
  } else {
    console.log('❌ User search returned no results');
  }

  // Test user stats
  console.log('Testing getUserStats...');
  const userStats = await UserService.getUserStats(testUserId);
  
  if (userStats) {
    console.log('✅ User stats retrieved successfully');
    console.log('Followers count:', userStats.followersCount);
    console.log('Following count:', userStats.followingCount);
    console.log('Posts count:', userStats.postsCount);
  } else {
    console.log('❌ Failed to retrieve user stats');
  }

  // Test follow functionality
  console.log('Testing follow functionality...');
  
  // Create another test user to follow
  const testUserId2 = 'test-user-2-' + Date.now();
  const userData2 = {
    id: testUserId2,
    email: `test2${Date.now()}@example.com`,
    username: `testuser2${Date.now()}`,
    full_name: 'Test User 2'
  };
  
  const createdUser2 = await UserService.createOrUpdateUser(userData2);
  
  if (createdUser2) {
    console.log('✅ Second test user created');
    
    // Test following
    const followResult = await UserService.followUser(testUserId, testUserId2);
    
    if (followResult) {
      console.log('✅ Successfully followed user');
      
      // Test if following
      const isFollowing = await UserService.isFollowing(testUserId, testUserId2);
      console.log('Is following:', isFollowing);
      
      // Get followers count
      const followersCount = await UserService.getFollowersCount(testUserId2);
      console.log('Followers count for user 2:', followersCount);
      
      // Get following count
      const followingCount = await UserService.getFollowingCount(testUserId);
      console.log('Following count for user 1:', followingCount);
    } else {
      console.log('❌ Failed to follow user');
    }
  } else {
    console.log('❌ Failed to create second test user');
  }

  // Clean up - delete the test users
  console.log('Cleaning up test users...');
  
  const { error: deleteError1 } = await supabase
    .from('users')
    .delete()
    .eq('id', testUserId);

  const { error: deleteError2 } = await supabase
    .from('users')
    .delete()
    .eq('id', testUserId2);

  if (deleteError1 || deleteError2) {
    console.log('❌ Error deleting test users:', deleteError1?.message || deleteError2?.message);
  } else {
    console.log('✅ Test users deleted successfully');
  }

  console.log('🎉 UserService testing completed');

} catch (error) {
  console.log('❌ Error:', error.message);
  console.log('Stack trace:', error.stack);
}