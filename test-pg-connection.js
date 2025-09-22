import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');
    
    const res = await client.query('SELECT 1 as test');
    console.log('Query result:', res.rows);
    
    await client.end();
  } catch (err) {
    console.error('Connection error:', err);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    if (err.stack) {
      console.error('Error stack:', err.stack);
    }
  }
}

testConnection();