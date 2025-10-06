// Create users table using direct PostgreSQL connection
import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

console.log('Creating users table using direct PostgreSQL connection...');

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

async function createUsersTable() {
  try {
    console.log('Connecting to PostgreSQL database...');
    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL database');

    // Check if users table already exists
    console.log('Checking if users table exists...');
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);
    
    const tableExists = checkResult.rows[0].exists;
    
    if (tableExists) {
      console.log('✅ Users table already exists');
    } else {
      console.log('Users table does not exist. Creating it...');
      
      // Create the users table with appropriate columns
      await client.query(`
        CREATE TABLE public.users (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          username TEXT UNIQUE,
          full_name TEXT,
          avatar_url TEXT,
          banner_url TEXT,
          bio TEXT,
          location TEXT,
          website TEXT,
          phone TEXT,
          date_of_birth TEXT,
          gender TEXT,
          is_verified BOOLEAN DEFAULT false,
          points INTEGER DEFAULT 0,
          level TEXT DEFAULT 'bronze',
          role TEXT DEFAULT 'user',
          reputation INTEGER DEFAULT 0,
          followers_count INTEGER DEFAULT 0,
          following_count INTEGER DEFAULT 0,
          posts_count INTEGER DEFAULT 0,
          profile_views INTEGER DEFAULT 0,
          is_online BOOLEAN DEFAULT false,
          last_active TIMESTAMP WITH TIME ZONE,
          profile_visibility TEXT DEFAULT 'public',
          allow_direct_messages BOOLEAN DEFAULT true,
          allow_notifications BOOLEAN DEFAULT true,
          preferred_currency TEXT DEFAULT 'USD',
          timezone TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
      
      console.log('✅ Users table created successfully');
      
      // Create indexes for better performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email)
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username)
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_full_name ON public.users (full_name)
      `);
      
      console.log('✅ Indexes created successfully');
    }

    // Check if we need to create the posts table as well (based on our previous tests)
    console.log('Checking if posts table has the correct structure...');
    const postsCheckResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'posts' 
      AND table_schema = 'public'
      AND column_name IN ('id', 'user_id', 'content', 'eloits')
      ORDER BY column_name
    `);
    
    console.log('Posts table structure:');
    postsCheckResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    // Check profiles table structure
    console.log('Checking profiles table structure...');
    const profilesCheckResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND table_schema = 'public'
      AND column_name IN ('user_id', 'username', 'full_name', 'avatar', 'avatar_url', 'bio')
      ORDER BY column_name
    `);
    
    console.log('Profiles table structure:');
    profilesCheckResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

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
    
    console.log('🎉 Script execution completed');
  }
}

// Run the script
createUsersTable();