import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

try {
  const sql = neon(process.env.DATABASE_URL);
  console.log('Connection successful!');
} catch (error) {
  console.error('Connection failed:', error.message);
}