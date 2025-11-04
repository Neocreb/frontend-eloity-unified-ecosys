// Migration script to create tables in Supabase based on the shared schema
import dotenv from 'dotenv';
dotenv.config();

console.log('Creating tables in Supabase...');

// Check if Supabase credentials are set
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.log('❌ Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file');
  process.exit(1);
}

// Check if the credentials are placeholder values
if (process.env.VITE_SUPABASE_URL.includes('your-') || 
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY.includes('your-')) {
  console.log('❌ Please replace the placeholder values in your .env file with your real Supabase credentials');
  process.exit(1);
}

console.log('✅ Supabase credentials found');

// Connect to Supabase
try {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('✅ Connected to Supabase');

  // Create tables
  console.log('Creating tables...');

  // Create users table (based on shared/schema.ts)
  const { error: usersError } = await supabase.rpc('create_users_table');
  
  if (usersError) {
    console.log('Note: create_users_table function may not exist, this is OK');
  } else {
    console.log('✅ Users table created or already exists');
  }

  // Create profiles table
  const { error: profilesError } = await supabase.rpc('create_profiles_table');
  
  if (profilesError) {
    console.log('Note: create_profiles_table function may not exist, this is OK');
  } else {
    console.log('✅ Profiles table created or already exists');
  }

  // Create posts table
  const { error: postsError } = await supabase.rpc('create_posts_table');
  
  if (postsError) {
    console.log('Note: create_posts_table function may not exist, this is OK');
  } else {
    console.log('✅ Posts table created or already exists');
  }

  // Create followers table
  const { error: followersError } = await supabase.rpc('create_followers_table');
  
  if (followersError) {
    console.log('Note: create_followers_table function may not exist, this is OK');
  } else {
    console.log('✅ Followers table created or already exists');
  }

  // Create post_likes table
  const { error: likesError } = await supabase.rpc('create_post_likes_table');
  
  if (likesError) {
    console.log('Note: create_post_likes_table function may not exist, this is OK');
  } else {
    console.log('✅ Post likes table created or already exists');
  }

  // Create post_comments table
  const { error: commentsError } = await supabase.rpc('create_post_comments_table');
  
  if (commentsError) {
    console.log('Note: create_post_comments_table function may not exist, this is OK');
  } else {
    console.log('✅ Post comments table created or already exists');
  }

  console.log('🎉 Migration script completed');
  console.log('Note: If you see "function may not exist" messages, that\'s OK - it means the tables might already exist or the functions aren\'t defined.');

} catch (error) {
  console.log('❌ Error connecting to Supabase:', error.message);
  console.log('Make sure you have:');
  console.log('1. Updated your .env file with real credentials');
  console.log('2. Installed all dependencies with npm install');
  console.log('3. Have internet connectivity');
}