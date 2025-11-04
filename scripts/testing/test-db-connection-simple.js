import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('Testing database connection...');
  
  // Try with the standard Supabase URL instead of db. subdomain
  const standardUrl = "postgresql://postgres:Blog*star123456@hjebzdekquczudhrygns.supabase.co:5432/postgres";
  console.log('Standard URL:', standardUrl);
  
  try {
    const client = postgres(standardUrl, {
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    const result = await client`SELECT version()`;
    console.log('✅ Database connection successful!');
    console.log('PostgreSQL version:', result[0].version);
  } catch (error) {
    console.error('❌ Database connection failed with standard URL:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
  }
  
  // Also try with the original URL
  console.log('\nTrying original URL:', process.env.DATABASE_URL);
  try {
    const client = postgres(process.env.DATABASE_URL, {
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    const result = await client`SELECT version()`;
    console.log('✅ Database connection successful!');
    console.log('PostgreSQL version:', result[0].version);
  } catch (error) {
    console.error('❌ Database connection failed with original URL:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
  }
}

testConnection();