import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await sql('SELECT COUNT(*) as count FROM users');
    console.log('Users count:', result[0].count);
    
    // Test other tables
    const productsResult = await sql('SELECT COUNT(*) as count FROM products');
    console.log('Products count:', productsResult[0].count);
    
    const freelanceResult = await sql('SELECT COUNT(*) as count FROM freelance_projects');
    console.log('Freelance projects count:', freelanceResult[0].count);
    
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Database connection error:', error.message);
  }
}

testConnection();