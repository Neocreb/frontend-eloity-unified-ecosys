// Test the updated UserService
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing UserService...');

// Connect to Supabase
try {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('✅ Connected to Supabase');

  // Test creating a user profile
  console.log('Testing user profile creation...');
  
  // Generate a random user ID for testing
  const testUserId = 'test-user-' + Date.now();
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: testUserId,
      username: 'testuser',
      full_name: 'Test User',
      bio: 'This is a test user'
    })
    .select();

  if (error) {
    console.log('❌ Error creating test user:', error.message);
  } else {
    console.log('✅ Test user created successfully');
    console.log('User data:', data);
  }

  // Test updating the user profile
  console.log('Testing user profile update...');
  
  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update({
      bio: 'This is an updated test user bio'
    })
    .eq('user_id', testUserId)
    .select();

  if (updateError) {
    console.log('❌ Error updating test user:', updateError.message);
  } else {
    console.log('✅ Test user updated successfully');
    console.log('Updated data:', updateData);
  }

  // Clean up - delete the test user
  console.log('Cleaning up test user...');
  
  const { error: deleteError } = await supabase
    .from('profiles')
    .delete()
    .eq('user_id', testUserId);

  if (deleteError) {
    console.log('❌ Error deleting test user:', deleteError.message);
  } else {
    console.log('✅ Test user deleted successfully');
  }

  console.log('🎉 UserService testing completed');

} catch (error) {
  console.log('❌ Error connecting to Supabase:', error.message);
}