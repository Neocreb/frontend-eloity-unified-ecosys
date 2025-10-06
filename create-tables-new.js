// Script to create tables in Supabase using direct table operations
import dotenv from 'dotenv';
dotenv.config();

console.log('Creating tables in Supabase...');

// Check if Supabase credentials are set
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.log('❌ Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file');
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

  // First, let's check if the profiles table exists by trying to query it
  console.log('Checking if profiles table exists...');
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);

  if (profilesError && profilesError.message.includes('relation "profiles" does not exist')) {
    console.log('Profiles table does not exist. Creating it...');
    
    // We'll create a minimal profiles table first
    const { error: createProfilesError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE public.profiles (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createProfilesError) {
      console.log('Error creating profiles table:', createProfilesError.message);
    } else {
      console.log('✅ Profiles table created successfully');
    }
  } else {
    console.log('✅ Profiles table already exists');
  }

  // Check if users table exists
  console.log('Checking if users table exists...');
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('id')
    .limit(1);

  if (usersError && usersError.message.includes('relation "users" does not exist')) {
    console.log('Users table does not exist. Creating it...');
    
    // We'll create a minimal users table first
    const { error: createUsersError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE public.users (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createUsersError) {
      console.log('Error creating users table:', createUsersError.message);
    } else {
      console.log('✅ Users table created successfully');
    }
  } else {
    console.log('✅ Users table already exists');
  }

  console.log('🎉 Table creation process completed');

} catch (error) {
  console.log('❌ Error connecting to Supabase:', error.message);
  console.log('Make sure you have:');
  console.log('1. Updated your .env file with real credentials');
  console.log('2. Installed all dependencies with npm install');
  console.log('3. Have internet connectivity');
}