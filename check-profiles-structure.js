// Script to check the actual structure of the profiles table
import dotenv from 'dotenv';
dotenv.config();

console.log('Checking actual profiles table structure...');

// Connect to Supabase
try {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('✅ Connected to Supabase');

  // Try to get column information using a different approach
  const { data, error } = await supabase.rpc('execute_sql', {
    sql: `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND table_schema = 'public'
    `
  });

  if (error) {
    console.log('❌ Error getting column information:', error.message);
    
    // Try a simpler approach - just select all data
    console.log('Trying to select all data from profiles table...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profileError) {
      console.log('❌ Error selecting from profiles table:', profileError.message);
    } else {
      console.log('✅ Profiles table data (first row):');
      if (profileData && profileData.length > 0) {
        const profile = profileData[0];
        Object.keys(profile).forEach(key => {
          console.log(`  - ${key}: ${profile[key]} (${typeof profile[key]})`);
        });
      } else {
        console.log('  - No data found in profiles table');
      }
    }
  } else {
    console.log('✅ Profiles table columns:');
    data.forEach(column => {
      console.log(`  - ${column.column_name} (${column.data_type})`);
    });
  }

} catch (error) {
  console.log('❌ Error connecting to Supabase:', error.message);
}