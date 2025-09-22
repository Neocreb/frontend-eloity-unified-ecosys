import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    const client = postgres('postgresql://postgres:Blog*star123456@hjebzdekquczudhrygns.supabase.co:5432/postgres');
    console.log('Connected successfully');
    
    // Test query
    const result = await client`SELECT COUNT(*) FROM users`;
    console.log('User count:', result[0].count);
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testConnection();