const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking RLS policies...');

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSPolicies() {
  console.log('\n🔍 Checking RLS status for key tables...');
  
  const tablesToCheck = ['stories', 'profiles', 'posts', 'live_streams', 'battles'];
  
  for (const tableName of tablesToCheck) {
    try {
      // Check if RLS is enabled
      const { data: rlsData, error: rlsError } = await supabase.rpc('execute_sql', {
        sql: `
          SELECT 
            tablename,
            relrowsecurity as rls_enabled,
            relforcerowsecurity as rls_forced
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public' AND tablename = '${tableName}';
        `
      });
      
      if (rlsError) {
        console.log(`❌ Error checking RLS for ${tableName}:`, rlsError.message);
      } else if (rlsData && rlsData.result && rlsData.result.rows.length > 0) {
        const row = rlsData.result.rows[0];
        console.log(`📋 ${tableName}: RLS ${row.rls_enabled ? 'ENABLED' : 'DISABLED'}, Forced: ${row.rls_forced ? 'YES' : 'NO'}`);
      } else {
        console.log(`❓ ${tableName}: Could not determine RLS status`);
      }
      
      // Check policies if RLS is enabled
      if (rlsData && rlsData.result && rlsData.result.rows.length > 0 && rlsData.result.rows[0].rls_enabled) {
        const { data: policyData, error: policyError } = await supabase.rpc('execute_sql', {
          sql: `
            SELECT 
              polname as policy_name,
              polcmd as command,
              polqual as using_clause,
              polwithcheck as with_check_clause
            FROM pg_policy p
            JOIN pg_class c ON p.polrelid = c.oid
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relname = '${tableName}';
          `
        });
        
        if (policyError) {
          console.log(`❌ Error checking policies for ${tableName}:`, policyError.message);
        } else if (policyData && policyData.result && policyData.result.rows.length > 0) {
          console.log(`   🔐 Policies for ${tableName}:`);
          policyData.result.rows.forEach(policy => {
            console.log(`     - ${policy.policy_name} (${policy.command})`);
          });
        } else {
          console.log(`   ⚠️  No policies found for ${tableName}`);
        }
      }
    } catch (err) {
      console.log(`❌ Error checking ${tableName}:`, err.message);
    }
  }
  
  console.log('\n🔍 Checking table permissions...');
  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT 
          table_name,
          privilege_type,
          grantee
        FROM information_schema.role_table_grants
        WHERE table_schema = 'public'
          AND table_name IN ('stories', 'profiles', 'posts', 'live_streams', 'battles')
          AND grantee IN ('anon', 'authenticated')
        ORDER BY table_name, grantee, privilege_type;
      `
    });
    
    if (error) {
      console.log('❌ Error checking permissions:', error.message);
    } else {
      console.log('📋 Table permissions:');
      if (data && data.result && data.result.rows.length > 0) {
        data.result.rows.forEach(row => {
          console.log(`  - ${row.table_name}: ${row.privilege_type} for ${row.grantee}`);
        });
      } else {
        console.log('  No permissions found for key tables');
      }
    }
  } catch (err) {
    console.log('❌ Error checking permissions:', err.message);
  }
}

checkRLSPolicies();