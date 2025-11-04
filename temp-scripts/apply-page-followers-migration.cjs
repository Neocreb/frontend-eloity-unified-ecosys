const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Get database URL from .env.local
const envLocal = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = envLocal.match(/DATABASE_URL=(.*)/);
const databaseUrl = dbUrlMatch ? dbUrlMatch[1] : null;

if (!databaseUrl) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

console.log('Connecting to database...');

const client = new Client({
  connectionString: databaseUrl,
});

async function applyPageFollowersMigration() {
  try {
    await client.connect();
    console.log('Connected to database successfully!');

    // Apply only our specific migration
    const migrationFile = 'migrations/0017_fix_page_followers_policies.sql';
    console.log(`Applying migration: ${migrationFile}`);
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
    
    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        try {
          await client.query(trimmedStatement);
          console.log(`Executed: ${trimmedStatement.substring(0, 50)}...`);
        } catch (error) {
          // Skip NOTIFY errors as they're just notifications
          if (!trimmedStatement.startsWith('NOTIFY')) {
            console.error(`Error executing statement: ${trimmedStatement}`);
            console.error(error.message);
            throw error;
          } else {
            console.log(`Notification sent: ${trimmedStatement}`);
          }
        }
      }
    }
    
    console.log(`Migration ${migrationFile} applied successfully!\n`);

    console.log('Page followers migration applied successfully!');
  } catch (error) {
    console.error('Error applying page followers migration:', error);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

applyPageFollowersMigration();