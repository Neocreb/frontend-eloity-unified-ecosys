// Final test to verify the complete integration
import dotenv from 'dotenv';
dotenv.config();

console.log('Final integration test...');

// Connect to Supabase
try {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('✅ Connected to Supabase');

  // Test querying the users table
  console.log('Testing users table query...');
  
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('id, email, username, full_name')
    .limit(5);

  if (usersError) {
    console.log('❌ Error querying users table:', usersError.message);
  } else {
    console.log('✅ Successfully queried users table');
    console.log('Found', usersData.length, 'users');
    if (usersData.length > 0) {
      console.log('Sample user:', {
        id: usersData[0].id,
        email: usersData[0].email,
        username: usersData[0].username,
        full_name: usersData[0].full_name
      });
    }
  }

  // Test querying the profiles table
  console.log('Testing profiles table query...');
  
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, username, full_name')
    .limit(5);

  if (profilesError) {
    console.log('❌ Error querying profiles table:', profilesError.message);
  } else {
    console.log('✅ Successfully queried profiles table');
    console.log('Found', profilesData.length, 'profiles');
    if (profilesData.length > 0) {
      console.log('Sample profile:', {
        user_id: profilesData[0].user_id,
        username: profilesData[0].username,
        full_name: profilesData[0].full_name
      });
    }
  }

  // Test querying the posts table
  console.log('Testing posts table query...');
  
  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select('id, user_id, content')
    .limit(5);

  if (postsError) {
    console.log('❌ Error querying posts table:', postsError.message);
  } else {
    console.log('✅ Successfully queried posts table');
    console.log('Found', postsData.length, 'posts');
    if (postsData.length > 0) {
      console.log('Sample post:', {
        id: postsData[0].id,
        user_id: postsData[0].user_id,
        content: postsData[0].content
      });
    }
  }

  // Test querying the followers table
  console.log('Testing followers table query...');
  
  const { data: followersData, error: followersError } = await supabase
    .from('followers')
    .select('follower_id, following_id')
    .limit(5);

  if (followersError) {
    console.log('❌ Error querying followers table:', followersError.message);
  } else {
    console.log('✅ Successfully queried followers table');
    console.log('Found', followersData.length, 'follow relationships');
    if (followersData.length > 0) {
      console.log('Sample follow relationship:', {
        follower_id: followersData[0].follower_id,
        following_id: followersData[0].following_id
      });
    }
  }

  console.log('🎉 Final integration test completed successfully!');

} catch (error) {
  console.log('❌ Error connecting to Supabase:', error.message);
}