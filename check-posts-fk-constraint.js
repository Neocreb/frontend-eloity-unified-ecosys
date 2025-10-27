import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkForeignKeyConstraints() {
  console.log('🔍 Checking foreign key constraints for posts table...\n');
  
  try {
    // Check if the foreign key constraint exists
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT 
          tc.constraint_name,
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
          AND tc.table_name = 'posts'
        ORDER BY tc.table_name, kcu.column_name;
      `
    });
    
    if (error) {
      console.log('❌ Error checking foreign key constraints:', error.message);
      return;
    }
    
    console.log('📋 Foreign key constraints on posts table:');
    if (data && data.result && data.result.rows.length > 0) {
      data.result.rows.forEach(row => {
        console.log(`  - ${row.constraint_name}: ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
      });
    } else {
      console.log('  No foreign key constraints found on posts table');
    }
    
    // Check if there are any posts with invalid user_ids
    console.log('\n🔍 Checking for posts with invalid user_ids...');
    
    const { data: invalidPosts, error: invalidPostsError } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT p.id, p.user_id
        FROM posts p
        LEFT JOIN profiles pr ON p.user_id = pr.user_id
        WHERE pr.user_id IS NULL
        LIMIT 10;
      `
    });
    
    if (invalidPostsError) {
      console.log('❌ Error checking invalid posts:', invalidPostsError.message);
    } else {
      if (invalidPosts && invalidPosts.result && invalidPosts.result.rows.length > 0) {
        console.log(`❌ Found ${invalidPosts.result.rows.length} posts with invalid user_ids:`);
        invalidPosts.result.rows.forEach(row => {
          console.log(`  - Post ID: ${row.id}, User ID: ${row.user_id}`);
        });
      } else {
        console.log('✅ All posts have valid user_ids');
      }
    }
    
    // Check if there are any profiles
    console.log('\n🔍 Checking profiles table...');
    
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('❌ Error counting profiles:', countError.message);
    } else {
      console.log(`✅ Found ${count} profiles in the database`);
    }
    
    // Check current user
    console.log('\n🔍 Checking current user...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ Error getting current user:', userError.message);
    } else if (user) {
      console.log(`✅ Current user ID: ${user.id}`);
      
      // Check if current user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) {
        console.log('❌ Error checking user profile:', profileError.message);
      } else if (profile) {
        console.log('✅ Current user has a profile');
      } else {
        console.log('❌ Current user does not have a profile');
      }
    } else {
      console.log('⚠️  No user is currently authenticated');
    }
    
  } catch (error) {
    console.error('❌ Error during foreign key constraint check:', error.message);
  }
}

checkForeignKeyConstraints();