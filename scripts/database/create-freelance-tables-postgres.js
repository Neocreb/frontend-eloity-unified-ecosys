import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function createFreelanceTables() {
  console.log('Creating freelance tables in PostgreSQL...');
  
  // Connect to PostgreSQL using the DATABASE_URL from .env
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // 1. Create freelancer_profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS freelancer_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        description TEXT,
        skills TEXT[],
        hourly_rate DECIMAL(10,2),
        experience VARCHAR(100),
        portfolio TEXT[],
        rating DECIMAL(3,2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        total_earnings DECIMAL(12,2) DEFAULT 0,
        completed_projects INTEGER DEFAULT 0,
        availability VARCHAR(20) DEFAULT 'available',
        languages TEXT[],
        education TEXT[],
        certifications TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Create indexes for freelancer_profiles
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_user_id ON freelancer_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_rating ON freelancer_profiles(rating);
      CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_skills ON freelancer_profiles USING GIN(skills);
    `);
    
    console.log('✓ freelancer_profiles table created');
    
    // 2. Create job_postings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_postings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        description TEXT,
        category VARCHAR(100),
        subcategory VARCHAR(100),
        skills TEXT[],
        budget_type VARCHAR(20),
        budget_amount DECIMAL(12,2),
        budget_min DECIMAL(12,2),
        budget_max DECIMAL(12,2),
        duration VARCHAR(50),
        experience_level VARCHAR(20),
        status VARCHAR(20) DEFAULT 'active',
        posted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deadline TIMESTAMP WITH TIME ZONE,
        applications_count INTEGER DEFAULT 0,
        attachments TEXT[],
        location VARCHAR(255),
        is_remote BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Create indexes for job_postings
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_job_postings_client_id ON job_postings(client_id);
      CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
      CREATE INDEX IF NOT EXISTS idx_job_postings_category ON job_postings(category);
      CREATE INDEX IF NOT EXISTS idx_job_postings_skills ON job_postings USING GIN(skills);
      CREATE INDEX IF NOT EXISTS idx_job_postings_posted_date ON job_postings(posted_date);
    `);
    
    console.log('✓ job_postings table created');
    
    // 3. Create proposals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS proposals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
        freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        cover_letter TEXT,
        proposed_rate DECIMAL(12,2),
        proposed_duration VARCHAR(100),
        attachments TEXT[],
        status VARCHAR(20) DEFAULT 'pending',
        submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Create indexes for proposals
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_proposals_job_id ON proposals(job_id);
      CREATE INDEX IF NOT EXISTS idx_proposals_freelancer_id ON proposals(freelancer_id);
      CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
    `);
    
    console.log('✓ proposals table created');
    
    // 4. Create projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
        client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        description TEXT,
        budget DECIMAL(12,2),
        status VARCHAR(20) DEFAULT 'pending',
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE,
        contract_terms TEXT,
        escrow_amount DECIMAL(12,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Create indexes for projects
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_job_id ON projects(job_id);
      CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
      CREATE INDEX IF NOT EXISTS idx_projects_freelancer_id ON projects(freelancer_id);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    `);
    
    console.log('✓ projects table created');
    
    // 5. Create milestones table
    await client.query(`
      CREATE TABLE IF NOT EXISTS milestones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255),
        description TEXT,
        amount DECIMAL(12,2),
        due_date TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'pending',
        submission_date TIMESTAMP WITH TIME ZONE,
        approval_date TIMESTAMP WITH TIME ZONE,
        deliverables TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Create indexes for milestones
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
      CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);
    `);
    
    console.log('✓ milestones table created');
    
    // 6. Create freelance_stats table
    await client.query(`
      CREATE TABLE IF NOT EXISTS freelance_stats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        total_projects INTEGER DEFAULT 0,
        completed_projects INTEGER DEFAULT 0,
        total_earnings DECIMAL(12,2) DEFAULT 0,
        average_rating DECIMAL(3,2) DEFAULT 0,
        response_time INTEGER, -- in hours
        success_rate DECIMAL(5,2) DEFAULT 0,
        repeat_clients INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `);
    
    // Create indexes for freelance_stats
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_freelance_stats_user_id ON freelance_stats(user_id);
    `);
    
    console.log('✓ freelance_stats table created');
    
    console.log('\n✅ All freelance tables created successfully!');
    
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await client.end();
  }
}

// Run the function
createFreelanceTables();