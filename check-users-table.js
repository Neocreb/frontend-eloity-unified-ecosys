// Check the structure of the users table
import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

console.log('Checking users table structure...');

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

// Create a new PostgreSQL client
const client = new Client({
  connectionString: databaseUrl,
});

async function checkUsersTable() {
  try {
    console.log('Connecting to PostgreSQL database...');
    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL database');

    // Check users table structure
    console.log('Checking users table structure...');
    const usersCheckResult = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('Users table structure:');
    usersCheckResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable})`);
    });

    // Check if we can query the test user we created earlier
    console.log('\nChecking test user data...');
    const userData = await client.query(`
      SELECT id, email, username, full_name, created_at 
      FROM users 
      WHERE email = 'test@example.com'
      LIMIT 1
    `);
    
    if (userData.rows.length > 0) {
      console.log('✅ Test user found in database');
      console.log('User data:', userData.rows[0]);
    } else {
      console.log('ℹ️  No test user found with email test@example.com');
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    // Close the database connection
    try {
      await client.end();
      console.log('✅ Database connection closed');
    } catch (error) {
      console.log('❌ Error closing database connection:', error.message);
    }
    
    console.log('🎉 Table structure check completed');
  }
}

// Run the script
checkUsersTable();