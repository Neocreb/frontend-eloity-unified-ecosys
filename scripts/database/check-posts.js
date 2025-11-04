// Script to check the structure of the posts table
import dotenv from 'dotenv';
dotenv.config();

console.log('Checking posts table structure...');

// Connect to Supabase
try {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('✅ Connected to Supabase');

  // Get the structure of the posts table
  console.log('Checking posts table structure...');
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ Error querying posts table:', error.message);
  } else {
    console.log('✅ Posts table structure:');
    if (data && data.length > 0) {
      const post = data[0];
      Object.keys(post).forEach(key => {
        console.log(`  - ${key}: ${typeof post[key]}`);
      });
    } else {
      console.log('  - No data found in posts table');
    }
  }

} catch (error) {
  console.log('❌ Error connecting to Supabase:', error.message);
}