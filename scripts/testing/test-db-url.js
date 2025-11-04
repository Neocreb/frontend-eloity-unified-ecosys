import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

console.log('DATABASE_URL from env:', process.env.DATABASE_URL);

// Try to create a connection with the URL
try {
  const client = postgres(process.env.DATABASE_URL, { 
    ssl: {
      rejectUnauthorized: false
    }
  });
  console.log('Connection object created successfully');
} catch (error) {
  console.error('Error creating connection:', error.message);
}