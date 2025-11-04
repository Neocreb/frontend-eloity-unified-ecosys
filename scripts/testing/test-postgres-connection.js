// Test direct PostgreSQL connection to Supabase
import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

console.log('Testing direct PostgreSQL connection to Supabase...');

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

console.log('✅ DATABASE_URL found');

// Create a new PostgreSQL client
const client = new Client({
  connectionString: databaseUrl,
});

async function testConnection() {
  try {
    console.log('Connecting to PostgreSQL database...');
    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL database');

    // Test a simple query to check if we can access the database
    console.log('Testing database query...');
    const result = await client.query('SELECT version()');
    console.log('✅ Database query successful');
    console.log('PostgreSQL version:', result.rows[0].version);

    // Check what tables exist in the public schema
    console.log('Checking existing tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('✅ Tables query successful');
    console.log('Existing tables in public schema:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Try to create a test table to verify write permissions
    console.log('Testing table creation...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_connection (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        test_data TEXT
      )
    `);
    console.log('✅ Test table created or already exists');

    // Insert a test record
    console.log('Testing data insertion...');
    await client.query(`
      INSERT INTO test_connection (test_data) 
      VALUES ('Connection test successful')
    `);
    console.log('✅ Test data inserted');

    // Query the test data
    console.log('Testing data retrieval...');
    const testData = await client.query(`
      SELECT * FROM test_connection 
      WHERE test_data = 'Connection test successful'
      ORDER BY created_at DESC
      LIMIT 1
    `);
    console.log('✅ Test data retrieved');
    console.log('Test record:', testData.rows[0]);

    // Clean up - delete the test record
    console.log('Cleaning up test data...');
    await client.query(`
      DELETE FROM test_connection 
      WHERE test_data = 'Connection test successful'
    `);
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.log('❌ Error:', error.message);
    
    // If it's a connection error, provide specific troubleshooting steps
    if (error.message.includes('connect') || error.message.includes('network') || error.message.includes('timeout')) {
      console.log('\nTroubleshooting steps:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the DATABASE_URL is correct');
      console.log('3. Check if your firewall is blocking the connection');
      console.log('4. Verify that your Supabase project is active');
    }
  } finally {
    // Close the database connection
    try {
      await client.end();
      console.log('✅ Database connection closed');
    } catch (error) {
      console.log('❌ Error closing database connection:', error.message);
    }
  }
}

// Run the test
testConnection();