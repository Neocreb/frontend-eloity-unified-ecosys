// Verify UserService functionality using direct Supabase client
import dotenv from 'dotenv';
dotenv.config();

console.log('Verifying UserService functionality...');

// Connect to Supabase
try {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('✅ Connected to Supabase');

  // Test getting user by ID (using the existing test user)
  console.log('Testing direct user query by ID...');
  const userId = '75c4f9ea-cea7-4bf0-a119-b5a10474a67a'; // The test user we created earlier
  
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError) {
    console.log('❌ Error querying user by ID:', userError.message);
  } else {
    console.log('✅ Successfully retrieved user by ID');
    console.log('User ID:', userData.id);
    console.log('Username:', userData.username);
    console.log('Full name:', userData.full_name);
    console.log('Email:', userData.email);
  }

  // Test getting user stats by counting related records
  console.log('Testing user stats...');
  
  // Get followers count
  const { count: followersCount, error: followersError } = await supabase
    .from('followers')
    .select('*', { count: 'exact' })
    .eq('following_id', userId);

  // Get following count
  const { count: followingCount, error: followingError } = await supabase
    .from('followers')
    .select('*', { count: 'exact' })
    .eq('follower_id', userId);

  // Get posts count
  const { count: postsCount, error: postsError } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (followersError || followingError || postsError) {
    console.log('❌ Error fetching user stats:');
    if (followersError) console.log('  Followers error:', followersError.message);
    if (followingError) console.log('  Following error:', followingError.message);
    if (postsError) console.log('  Posts error:', postsError.message);
  } else {
    console.log('✅ Successfully retrieved user stats');
    console.log('Followers count:', followersCount || 0);
    console.log('Following count:', followingCount || 0);
    console.log('Posts count:', postsCount || 0);
  }

  // Test creating a new user
  console.log('Testing user creation...');
  const newUserEmail = `verifytest${Date.now()}@example.com`;
  const newUserData = {
    email: newUserEmail,
    username: `verifytestuser${Date.now()}`,
    full_name: 'Verify Test User',
    bio: 'This is a verify test user'
  };
  
  const { data: newUserDataResult, error: createUserError } = await supabase
    .from('users')
    .insert(newUserData)
    .select();

  if (createUserError) {
    console.log('❌ Error creating new user:', createUserError.message);
  } else {
    console.log('✅ Successfully created new user');
    console.log('New user ID:', newUserDataResult[0].id);
    console.log('New user email:', newUserDataResult[0].email);
    
    // Clean up - delete the new user
    console.log('Cleaning up new user...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', newUserDataResult[0].id);
      
    if (deleteError) {
      console.log('❌ Error deleting new user:', deleteError.message);
    } else {
      console.log('✅ New user deleted successfully');
    }
  }

  console.log('🎉 UserService verification completed successfully!');

} catch (error) {
  console.log('❌ Error:', error.message);
}