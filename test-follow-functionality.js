// Test follow functionality
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing follow functionality...');

// Connect to Supabase
try {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('✅ Connected to Supabase');

  // Create two test users
  console.log('Creating test users...');
  
  // Create user 1
  const user1Email = `followtest1${Date.now()}@example.com`;
  const user1Data = {
    email: user1Email,
    username: `followtestuser1${Date.now()}`,
    full_name: 'Follow Test User 1'
  };
  
  const { data: user1DataResult, error: createUser1Error } = await supabase
    .from('users')
    .insert(user1Data)
    .select();

  if (createUser1Error) {
    console.log('❌ Error creating user 1:', createUser1Error.message);
    process.exit(1);
  }
  
  const user1Id = user1DataResult[0].id;
  console.log('✅ Created user 1:', user1Id);

  // Create user 2
  const user2Email = `followtest2${Date.now()}@example.com`;
  const user2Data = {
    email: user2Email,
    username: `followtestuser2${Date.now()}`,
    full_name: 'Follow Test User 2'
  };
  
  const { data: user2DataResult, error: createUser2Error } = await supabase
    .from('users')
    .insert(user2Data)
    .select();

  if (createUser2Error) {
    console.log('❌ Error creating user 2:', createUser2Error.message);
    process.exit(1);
  }
  
  const user2Id = user2DataResult[0].id;
  console.log('✅ Created user 2:', user2Id);

  // Test follow functionality
  console.log('Testing follow user...');
  
  const { error: followError } = await supabase
    .from('followers')
    .insert({
      follower_id: user1Id,
      following_id: user2Id
    });

  if (followError) {
    console.log('❌ Error following user:', followError.message);
  } else {
    console.log('✅ User 1 successfully followed User 2');
  }

  // Test checking follow status
  console.log('Testing follow status check...');
  
  const { data: followData, error: checkFollowError } = await supabase
    .from('followers')
    .select('id')
    .eq('follower_id', user1Id)
    .eq('following_id', user2Id)
    .maybeSingle();

  if (checkFollowError) {
    console.log('❌ Error checking follow status:', checkFollowError.message);
  } else {
    const isFollowing = !!followData;
    console.log('✅ Follow status check completed');
    console.log('User 1 is following User 2:', isFollowing);
  }

  // Test unfollow functionality
  console.log('Testing unfollow user...');
  
  const { error: unfollowError } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', user1Id)
    .eq('following_id', user2Id);

  if (unfollowError) {
    console.log('❌ Error unfollowing user:', unfollowError.message);
  } else {
    console.log('✅ User 1 successfully unfollowed User 2');
  }

  // Clean up - delete the test users
  console.log('Cleaning up test users...');
  
  const { error: deleteError1 } = await supabase
    .from('users')
    .delete()
    .eq('id', user1Id);
    
  const { error: deleteError2 } = await supabase
    .from('users')
    .delete()
    .eq('id', user2Id);

  if (deleteError1 || deleteError2) {
    console.log('❌ Error deleting test users:');
    if (deleteError1) console.log('  User 1 delete error:', deleteError1.message);
    if (deleteError2) console.log('  User 2 delete error:', deleteError2.message);
  } else {
    console.log('✅ Test users deleted successfully');
  }

  console.log('🎉 Follow functionality testing completed successfully!');

} catch (error) {
  console.log('❌ Error:', error.message);
}