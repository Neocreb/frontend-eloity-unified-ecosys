import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsertData() {
  console.log('Testing data insertion into freelance tables...');
  
  try {
    // Insert a sample freelancer profile
    console.log('\n1. Inserting sample freelancer profile...');
    const { data: profile, error: profileError } = await supabase
      .from('freelancer_profiles')
      .insert({
        title: 'Senior React Developer',
        description: 'Experienced frontend developer specializing in React and TypeScript',
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
        hourly_rate: 50.00,
        experience: '5+ years',
        portfolio: ['https://example.com/portfolio1', 'https://example.com/portfolio2'],
        rating: 4.8,
        review_count: 25,
        total_earnings: 15000.00,
        completed_projects: 30,
        availability: 'available',
        languages: ['English', 'Spanish'],
        education: ['BSc Computer Science'],
        certifications: ['React Certification'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (profileError) {
      console.error('Error inserting freelancer profile:', profileError);
    } else {
      console.log('✓ Freelancer profile inserted:', profile.id);
    }
    
    // Insert a sample job posting
    console.log('\n2. Inserting sample job posting...');
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .insert({
        title: 'Frontend Developer Needed',
        description: 'We need a skilled frontend developer to build a React application',
        category: 'Web Development',
        subcategory: 'Frontend',
        skills: ['React', 'TypeScript', 'CSS'],
        budget_type: 'fixed',
        budget_amount: 1500.00,
        duration: '1-2 months',
        experience_level: 'intermediate',
        status: 'active',
        posted_date: new Date().toISOString(),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        applications_count: 0,
        attachments: [],
        location: 'Remote',
        is_remote: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (jobError) {
      console.error('Error inserting job posting:', jobError);
    } else {
      console.log('✓ Job posting inserted:', job.id);
    }
    
    // Insert sample freelance stats
    console.log('\n3. Inserting sample freelance stats...');
    // First check if stats exist for a test user
    const testUserId = '00000000-0000-0000-0000-000000000000'; // Placeholder user ID
    
    const { data: existingStats, error: statsCheckError } = await supabase
      .from('freelance_stats')
      .select('id')
      .eq('user_id', testUserId)
      .single();
      
    if (!existingStats) {
      const { data: stats, error: statsError } = await supabase
        .from('freelance_stats')
        .insert({
          user_id: testUserId,
          total_projects: 35,
          completed_projects: 30,
          total_earnings: 15000.00,
          average_rating: 4.8,
          response_time: 2, // hours
          success_rate: 95.00,
          repeat_clients: 12,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (statsError) {
        console.error('Error inserting freelance stats:', statsError);
      } else {
        console.log('✓ Freelance stats inserted:', stats.id);
      }
    } else {
      console.log('✓ Freelance stats already exist for test user');
    }
    
    console.log('\n✅ Data insertion tests completed successfully!');
    
  } catch (error) {
    console.error('Error testing data insertion:', error);
  }
}

// Run the test
testInsertData();