const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyStoragePolicies() {
  console.log('🔧 Applying storage policies...\n');
  
  try {
    // Read the migration file
    const migrationSql = fs.readFileSync('supabase/migrations/20251026163000_fix_storage_policies.sql', 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📋 Found ${statements.length} SQL statements to execute...\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.startsWith('--') || statement.length === 0) {
        continue; // Skip comments
      }
      
      console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('execute_sql', {
          sql: statement
        });
        
        if (error) {
          console.log(`   ⚠️  Warning: ${error.message}`);
        } else {
          console.log('   ✅ Success');
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
      }
    }
    
    console.log('\n🎉 Storage policies applied successfully!');
    
    // Test if the policies work
    console.log('\n🔍 Testing storage policies...');
    
    const testFile = new Blob(['Test content'], { type: 'text/plain' });
    const fileName = `policy-test-${Date.now()}.txt`;
    
    const { data, error } = await supabase
      .storage
      .from('posts')
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.log('❌ Storage test failed:', error.message);
    } else {
      console.log('✅ Storage test passed!');
      
      // Clean up
      await supabase.storage.from('posts').remove([fileName]);
    }
    
  } catch (error) {
    console.error('❌ Error applying storage policies:', error.message);
  }
}

applyStoragePolicies();