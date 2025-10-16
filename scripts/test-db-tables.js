// Script to test database table access
import dotenv from 'dotenv';
dotenv.config();

async function testDbTables() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    // Check if Supabase credentials are set
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
      console.log('❌ Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file');
      process.exit(1);
    }
    
    // Create a Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    );
    
    console.log('✅ Connected to Supabase');
    
    // Test accessing existing tables
    const tablesToTest = [
      'users',
      'posts',
      'chat_ads',
      'flagged_messages',
      'admin_users'
    ];
    
    for (const table of tablesToTest) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: accessible`);
        }
      } catch (error) {
        console.log(`❌ ${table}: ${error.message}`);
      }
    }
    
    // Try to create a simple test table
    console.log('\nTrying to create a test table...');
    try {
      // First, let's try to see if we can execute raw SQL
      console.log('Testing raw SQL execution...');
      
      // Try a simple select query first
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (usersError) {
        console.log('❌ Error querying users table:', usersError.message);
      } else {
        console.log('✅ Successfully queried users table');
        console.log('Sample user data:', JSON.stringify(usersData[0], null, 2));
      }
    } catch (error) {
      console.log('❌ Error testing database:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDbTables();