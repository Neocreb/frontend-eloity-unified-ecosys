// Script to check the structure of the followers table
import dotenv from 'dotenv';
dotenv.config();

console.log('Checking followers table structure...');

// Connect to Supabase
try {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('✅ Connected to Supabase');

  // Get the structure of the followers table
  console.log('Checking followers table structure...');
  const { data, error } = await supabase
    .from('followers')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ Error querying followers table:', error.message);
  } else {
    console.log('✅ Followers table structure:');
    if (data && data.length > 0) {
      const follower = data[0];
      Object.keys(follower).forEach(key => {
        console.log(`  - ${key}: ${typeof follower[key]}`);
      });
    } else {
      console.log('  - No data found in followers table');
    }
  }

} catch (error) {
  console.log('❌ Error connecting to Supabase:', error.message);
}