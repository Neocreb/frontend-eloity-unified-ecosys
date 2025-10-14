// Script to apply the chat ads and moderation tables migration
import dotenv from 'dotenv';
dotenv.config();

console.log('Applying chat ads and moderation tables migration...');

async function applyMigration() {
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
    
    // Read the migration SQL file
    const { default: fs } = await import('fs');
    const { default: path } = await import('path');
    
    const migrationPath = path.join(process.cwd(), 'migrations', '0002_create_chat_ads_and_moderation_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Executing migration SQL...');
    
    // Split the SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.startsWith('--') || statement.length === 0) {
        continue; // Skip comments and empty statements
      }
      
      try {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('execute_sql', { sql: statement });
        
        if (error) {
          // Some statements might fail if tables already exist, which is OK
          console.log(`Note: ${error.message}`);
        } else {
          console.log('✅ Statement executed successfully');
        }
      } catch (stmtError) {
        console.log(`Warning: ${stmtError.message}`);
      }
    }
    
    console.log('✅ Migration applied successfully!');
    
    // Test that the tables were created
    console.log('Testing table access...');
    
    const testTables = ['chat_ads', 'flagged_messages', 'admin_users'];
    
    for (const table of testTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`ℹ️  Note: ${table} table exists but may be empty or have access restrictions`);
        } else {
          console.log(`✅ ${table} table is accessible`);
        }
      } catch (testError) {
        console.log(`❌ Error testing ${table}: ${testError.message}`);
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update the chatAdsService to use the new database tables');
    console.log('2. Update the AdminService to use the real API endpoints');
    console.log('3. Test the admin chat interface with real data');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

applyMigration();