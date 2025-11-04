import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

async function testConnection() {
  try {
    console.log('Creating postgres client...');
    const client = postgres(process.env.DATABASE_URL, { 
      ssl: {
        rejectUnauthorized: false
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('Attempting to connect...');
    // Test query
    const result = await client`SELECT 1 as test`;
    console.log('Query result:', result);
    console.log('Connected successfully!');
    
    await client.end();
  } catch (error) {
    console.error('Connection error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
  }
}

testConnection();