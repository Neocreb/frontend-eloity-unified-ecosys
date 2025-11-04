// Test the users table directly with Supabase client
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing users table with Supabase client...');

// Connect to Supabase
try {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('✅ Connected to Supabase');

  // Test creating a user
  console.log('Testing user creation in users table...');
  
  // Generate a random user ID for testing
  const testUserId = 'test-user-' + Date.now();
  const testEmail = `test${Date.now()}@example.com`;
  const testUsername = `testuser${Date.now()}`;
  
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      id: testUserId,
      email: testEmail,
      username: testUsername,
      full_name: 'Test User',
      bio: 'This is a test user for users table testing',
      is_verified: true,
      points: 100,
      level: 'gold'
    })
    .select();

  if (userError) {
    console.log('❌ Error creating test user:', userError.message);
  } else {
    console.log('✅ Test user created successfully in users table');
    console.log('User data:', userData[0]);
  }

  // Test retrieving the user by ID
  console.log('Testing user retrieval by ID...');
  
  const { data: retrievedUserData, error: retrieveError } = await supabase
    .from('users')
    .select('*')
    .eq('id', testUserId)
    .single();

  if (retrieveError) {
    console.log('❌ Error retrieving test user:', retrieveError.message);
  } else {
    console.log('✅ Test user retrieved successfully');
    console.log('User ID:', retrievedUserData.id);
    console.log('Email:', retrievedUserData.email);
    console.log('Username:', retrievedUserData.username);
    console.log('Full name:', retrievedUserData.full_name);
    console.log('Points:', retrievedUserData.points);
  }

  // Test updating the user
  console.log('Testing user update...');
  
  const { data: updatedUserData, error: updateError } = await supabase
    .from('users')
    .update({
      bio: 'This is an updated test user bio',
      points: 200
    })
    .eq('id', testUserId)
    .select();

  if (updateError) {
    console.log('❌ Error updating test user:', updateError.message);
  } else {
    console.log('✅ Test user updated successfully');
    console.log('Updated bio:', updatedUserData[0].bio);
    console.log('Updated points:', updatedUserData[0].points);
  }

  // Test searching users
  console.log('Testing user search...');
  
  const { data: searchResults, error: searchError } = await supabase
    .from('users')
    .select('*')
    .ilike('username', `%${testUsername}%`)
    .limit(5);

  if (searchError) {
    console.log('❌ Error searching users:', searchError.message);
  } else {
    console.log('✅ User search successful');
    console.log(`Found ${searchResults.length} users`);
    if (searchResults.length > 0) {
      console.log('First result username:', searchResults[0].username);
    }
  }

  // Clean up - delete the test user
  console.log('Cleaning up test user...');
  
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('id', testUserId);

  if (deleteError) {
    console.log('❌ Error deleting test user:', deleteError.message);
  } else {
    console.log('✅ Test user deleted successfully');
  }

  console.log('🎉 Users table testing completed');

} catch (error) {
  console.log('❌ Error connecting to Supabase:', error.message);
}