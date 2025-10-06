// Script to check the structure of the profiles table
import dotenv from 'dotenv';
dotenv.config();

console.log('Checking profiles table structure...');

// Connect to Supabase
try {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('✅ Connected to Supabase');

  // Get the structure of the profiles table
  console.log('Checking profiles table structure...');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ Error querying profiles table:', error.message);
    
    // Try to get column information
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public');

    if (columnsError) {
      console.log('❌ Error getting column information:', columnsError.message);
    } else {
      console.log('Profiles table columns:');
      columns.forEach(column => {
        console.log(`  - ${column.column_name} (${column.data_type})`);
      });
    }
  } else {
    console.log('✅ Profiles table structure:');
    if (data && data.length > 0) {
      const profile = data[0];
      Object.keys(profile).forEach(key => {
        console.log(`  - ${key}: ${typeof profile[key]}`);
      });
    } else {
      console.log('  - No data found in profiles table');
    }
  }

} catch (error) {
  console.log('❌ Error connecting to Supabase:', error.message);
}