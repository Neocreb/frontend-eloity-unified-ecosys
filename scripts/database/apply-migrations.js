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

async function applyMigrations() {
  try {
    await client.connect();
    console.log('Connected to database successfully!');

    // List of migration files in order
    const migrationFiles = [
      'migrations/0011_fix_videos_storage_and_policies.sql',
      'migrations/0012_fix_groups_policies.sql',
      'migrations/0013_fix_posts_storage_conflicts.sql'
    ];

    for (const file of migrationFiles) {
      console.log(`Applying migration: ${file}`);
      const sql = fs.readFileSync(file, 'utf8');
      
      // Split the SQL into individual statements (handling NOTIFY separately)
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
      
      console.log(`Migration ${file} applied successfully!\n`);
    }

    console.log('All migrations applied successfully!');
  } catch (error) {
    console.error('Error applying migrations:', error);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

applyMigrations();