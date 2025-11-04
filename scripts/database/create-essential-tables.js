import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function createEssentialTables() {
  try {
    console.log('Creating essential tables...');
    const sql = neon(process.env.DATABASE_URL);
    
    // Create users table
    await sql(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE,
        full_name TEXT,
        avatar_url TEXT,
        is_verified BOOLEAN DEFAULT false,
        points INTEGER DEFAULT 0,
        level TEXT DEFAULT 'bronze',
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Users table created successfully');
    
    // Create profiles table
    await sql(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        username TEXT UNIQUE,
        full_name TEXT,
        bio TEXT,
        avatar_url TEXT,
        is_verified BOOLEAN DEFAULT false,
        level TEXT DEFAULT 'bronze',
        points INTEGER DEFAULT 0,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Profiles table created successfully');
    
    // Create products table
    await sql(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        category TEXT NOT NULL,
        subcategory TEXT,
        images JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Products table created successfully');
    
    // Create freelance_jobs table
    await sql(`
      CREATE TABLE IF NOT EXISTS freelance_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        budget_type TEXT NOT NULL,
        budget_min NUMERIC(10, 2),
        budget_max NUMERIC(10, 2),
        experience_level TEXT NOT NULL,
        skills_required TEXT[],
        status TEXT DEFAULT 'open',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Freelance jobs table created successfully');
    
    console.log('All essential tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error.message);
  }
}

createEssentialTables();