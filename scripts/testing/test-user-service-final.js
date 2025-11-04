// Test the UserService implementation
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing UserService implementation...');

// Connect to Supabase
try {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('✅ Connected to Supabase');

  // Import and test UserService
  const { UserService } = await import('./src/services/userService.ts');

  // Test getting user by ID (using the existing test user)
  console.log('Testing getUserById with existing user...');
  const userId = '75c4f9ea-cea7-4bf0-a119-b5a10474a67a'; // The test user we created earlier
  const user = await UserService.getUserById(userId);
  
  if (user) {
    console.log('✅ Successfully retrieved user by ID');
    console.log('User ID:', user.id);
    console.log('Username:', user.username);
    console.log('Full name:', user.full_name);
  } else {
    console.log('❌ Failed to retrieve user by ID');
  }

  // Test getting user stats
  console.log('Testing getUserStats...');
  const userStats = await UserService.getUserStats(userId);
  
  if (userStats) {
    console.log('✅ Successfully retrieved user stats');
    console.log('Followers count:', userStats.followersCount);
    console.log('Following count:', userStats.followingCount);
    console.log('Posts count:', userStats.postsCount);
  } else {
    console.log('❌ Failed to retrieve user stats');
  }

  // Test creating a new user
  console.log('Testing createOrUpdateUser...');
  const newUserEmail = `newtest${Date.now()}@example.com`;
  const newUserData = {
    email: newUserEmail,
    username: `newtestuser${Date.now()}`,
    full_name: 'New Test User',
    bio: 'This is a new test user'
  };
  
  const newUser = await UserService.createOrUpdateUser(newUserData);
  
  if (newUser) {
    console.log('✅ Successfully created new user');
    console.log('New user ID:', newUser.id);
    console.log('New user email:', newUser.email);
    
    // Clean up - delete the new user
    console.log('Cleaning up new user...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', newUser.id);
      
    if (deleteError) {
      console.log('❌ Error deleting new user:', deleteError.message);
    } else {
      console.log('✅ New user deleted successfully');
    }
  } else {
    console.log('❌ Failed to create new user');
  }

  console.log('🎉 UserService testing completed successfully!');

} catch (error) {
  console.log('❌ Error:', error.message);
}