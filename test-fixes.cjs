const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing database fixes...');

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFixes() {
  console.log('\n🔍 Testing stories query with profiles join...');
  
  try {
    // This is the exact query from the error message
    const { data, error } = await supabase
      .from('stories')
      .select('id,user_id,created_at,media_url,profiles:user_id(username,full_name,avatar_url)')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.log('❌ Stories query with profiles join still failing:', error.message);
      console.log('   Error code:', error.code);
      console.log('   Error details:', error.details);
      console.log('   Error hint:', error.hint);
    } else {
      console.log('✅ Stories query with profiles join successful');
      if (data && data.length > 0) {
        console.log(`   Retrieved ${data.length} stories with profile data`);
      } else {
        console.log('   No stories found (which is OK)');
      }
    }
  } catch (err) {
    console.log('❌ Stories query with profiles join error:', err.message);
  }
  
  console.log('\n🔍 Testing profiles access with user_id...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id,username,full_name,avatar_url')
      .limit(3);
    
    if (error) {
      console.log('❌ Profiles access still failing:', error.message);
    } else {
      console.log('✅ Profiles access successful');
      if (data && data.length > 0) {
        console.log(`   Retrieved ${data.length} profiles`);
      }
    }
  } catch (err) {
    console.log('❌ Profiles access error:', err.message);
  }
  
  console.log('\n🔍 Testing the new stories_with_profiles view...');
  try {
    const { data, error } = await supabase
      .from('stories_with_profiles')
      .select('id,user_id,username,full_name,avatar_url,created_at,media_url')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.log('❌ stories_with_profiles view query failed:', error.message);
    } else {
      console.log('✅ stories_with_profiles view query successful');
      if (data && data.length > 0) {
        console.log(`   Retrieved ${data.length} stories with profile data from view`);
      } else {
        console.log('   No stories found in view (which is OK)');
      }
    }
  } catch (err) {
    console.log('❌ stories_with_profiles view query error:', err.message);
  }
  
  console.log('\n🔍 Checking foreign key constraints...');
  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT 
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_schema = 'public'
          AND (tc.table_name = 'stories' OR tc.table_name = 'profiles')
        ORDER BY tc.table_name, kcu.column_name;
      `
    });
    
    if (error) {
      console.log('❌ Foreign key check failed:', error.message);
    } else {
      console.log('✅ Foreign key check successful');
      if (data && data.result && data.result.rows) {
        console.log('\n📋 Foreign key relationships:');
        data.result.rows.forEach(row => {
          console.log(`  - ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
        });
      } else {
        console.log('  No foreign key relationships found');
      }
    }
  } catch (err) {
    console.log('❌ Foreign key check error:', err.message);
  }
}

testFixes();