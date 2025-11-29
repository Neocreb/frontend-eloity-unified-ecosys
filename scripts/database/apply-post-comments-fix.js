const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL || 
  (fs.existsSync('.env.local') && 
   fs.readFileSync('.env.local', 'utf8').match(/DATABASE_URL=(.*)/)?.[1]);

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment or .env.local');
  console.error('Please set the DATABASE_URL environment variable or add it to .env.local');
  process.exit(1);
}

console.log('🔗 Connecting to database...');

const client = new Client({
  connectionString: databaseUrl,
});

async function applyMigration() {
  try {
    await client.connect();
    console.log('✅ Connected to database successfully!\n');

    // Read the migration file
    const migrationFile = 'migrations/0043_fix_post_comments_profiles_relationship.sql';
    
    if (!fs.existsSync(migrationFile)) {
      console.error(`❌ Migration file not found: ${migrationFile}`);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
    
    console.log(`📝 Applying migration: ${migrationFile}\n`);
    
    // Execute the entire migration as a single transaction
    await client.query('BEGIN');
    
    try {
      await client.query(migrationSQL);
      await client.query('COMMIT');
      console.log('✅ Migration applied successfully!\n');
      console.log('🎉 The post_comments table now has a proper foreign key relationship with profiles.');
      console.log('   Comments can now be joined with profile data via the REST API.');
    } catch (execError) {
      await client.query('ROLLBACK');
      throw execError;
    }

  } catch (error) {
    console.error('❌ Error applying migration:');
    console.error(error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed.');
  }
}

applyMigration();
