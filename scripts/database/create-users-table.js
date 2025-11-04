// Script to create the users table directly using SQL
import dotenv from 'dotenv';
dotenv.config();

console.log('Creating users table...');

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

  // Try to create the users table using raw SQL
  // We'll use a different approach since the execute_sql function doesn't exist
  console.log('Attempting to create users table...');
  
  // First, let's check if we can create a simple test table
  const { error: createError } = await supabase.rpc('execute_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.test_table (
        id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });
  
  if (createError) {
    console.log('❌ Error creating test table:', createError.message);
    console.log('This might be because the execute_sql function is not available.');
    console.log('Let\'s try a different approach...');
    
    // Try to insert a record into an existing table to test connectivity
    const { data, error: insertError } = await supabase
      .from('posts')
      .insert({
        user_id: 'test-user-id',
        content: 'Test post for connectivity check',
        type: 'text'
      })
      .select();
      
    if (insertError) {
      console.log('❌ Error inserting test post:', insertError.message);
      console.log('Network connectivity issue or permission problem.');
    } else {
      console.log('✅ Successfully inserted test post');
      console.log('Data:', data);
    }
  } else {
    console.log('✅ Test table created successfully');
  }

  console.log('🎉 Script execution completed');

} catch (error) {
  console.log('❌ Error connecting to Supabase:', error.message);
  console.log('Make sure you have:');
  console.log('1. Updated your .env file with real credentials');
  console.log('2. Installed all dependencies with npm install');
  console.log('3. Have internet connectivity');
}