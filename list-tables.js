// Script to list all tables in Supabase
import dotenv from 'dotenv';
dotenv.config();

console.log('Listing tables in Supabase...');

// Connect to Supabase
try {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('✅ Connected to Supabase');

  // List all tables
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name, table_schema')
    .eq('table_schema', 'public');

  if (error) {
    console.log('❌ Error listing tables:', error.message);
  } else {
    console.log('✅ Tables in public schema:');
    data.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
  }

} catch (error) {
  console.log('❌ Error connecting to Supabase:', error.message);
}