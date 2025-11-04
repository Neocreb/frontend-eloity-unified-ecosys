// Test file to connect to your real Supabase instance
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing connection to your real Supabase instance...');

// Check if environment variables are properly set
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', process.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET');

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.log('❌ Please update your .env file with your real Supabase credentials');
  console.log('   VITE_SUPABASE_URL should be like: https://your-project-id.supabase.co');
  console.log('   VITE_SUPABASE_PUBLISHABLE_KEY should be your anon key from Supabase');
  process.exit(1);
}

// Check if the URL and key look real (not the placeholder values)
if (process.env.VITE_SUPABASE_URL.includes('your-project') || 
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY.includes('your-')) {
  console.log('❌ Please replace the placeholder values in your .env file with your real Supabase credentials');
  process.exit(1);
}

console.log('✅ Environment variables look correct');

// Try to connect to Supabase
try {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('✅ Supabase client created successfully');

  // Test a simple query to see if we can connect
  console.log('Testing database connection...');
  
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .limit(1);

  if (error) {
    console.log('❌ Error querying users table:', error.message);
    console.log('This might be because:');
    console.log('1. The table doesn\'t exist yet');
    console.log('2. Row Level Security (RLS) is blocking access');
    console.log('3. Network connectivity issues');
  } else {
    console.log('✅ Successfully connected to Supabase database!');
    console.log('Query result:', data);
  }

  // Try to create a test user
  console.log('Testing user creation...');
  
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      email: 'test@example.com',
      username: 'testuser',
      full_name: 'Test User'
    })
    .select();

  if (userError) {
    console.log('❌ Error creating test user:', userError.message);
    console.log('This might be because:');
    console.log('1. The users table doesn\'t exist yet');
    console.log('2. Row Level Security (RLS) is blocking inserts');
    console.log('3. Missing required fields');
  } else {
    console.log('✅ Successfully created test user!');
    console.log('User data:', userData);
  }

} catch (error) {
  console.log('❌ Error connecting to Supabase:', error.message);
  console.log('Make sure you have:');
  console.log('1. Updated your .env file with real credentials');
  console.log('2. Installed all dependencies with npm install');
  console.log('3. Have internet connectivity');
}