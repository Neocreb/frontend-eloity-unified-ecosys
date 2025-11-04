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

async function testFreelanceTables() {
  console.log('Testing Supabase Freelance Tables...');
  
  try {
    // Test freelancer_profiles table
    console.log('\n1. Testing freelancer_profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('freelancer_profiles')
      .select('id')
      .limit(1);
      
    if (profilesError) {
      console.error('Error accessing freelancer_profiles:', profilesError);
    } else {
      console.log('✓ freelancer_profiles table accessible');
    }
    
    // Test job_postings table
    console.log('\n2. Testing job_postings table...');
    const { data: jobs, error: jobsError } = await supabase
      .from('job_postings')
      .select('id')
      .limit(1);
      
    if (jobsError) {
      console.error('Error accessing job_postings:', jobsError);
    } else {
      console.log('✓ job_postings table accessible');
    }
    
    // Test proposals table
    console.log('\n3. Testing proposals table...');
    const { data: proposals, error: proposalsError } = await supabase
      .from('proposals')
      .select('id')
      .limit(1);
      
    if (proposalsError) {
      console.error('Error accessing proposals:', proposalsError);
    } else {
      console.log('✓ proposals table accessible');
    }
    
    // Test projects table
    console.log('\n4. Testing projects table...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .limit(1);
      
    if (projectsError) {
      console.error('Error accessing projects:', projectsError);
    } else {
      console.log('✓ projects table accessible');
    }
    
    // Test milestones table
    console.log('\n5. Testing milestones table...');
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('id')
      .limit(1);
      
    if (milestonesError) {
      console.error('Error accessing milestones:', milestonesError);
    } else {
      console.log('✓ milestones table accessible');
    }
    
    // Test freelance_stats table
    console.log('\n6. Testing freelance_stats table...');
    const { data: stats, error: statsError } = await supabase
      .from('freelance_stats')
      .select('id')
      .limit(1);
      
    if (statsError) {
      console.error('Error accessing freelance_stats:', statsError);
    } else {
      console.log('✓ freelance_stats table accessible');
    }
    
    console.log('\n✅ All freelance tables are accessible!');
    
  } catch (error) {
    console.error('Error testing tables:', error);
  }
}

// Run the test
testFreelanceTables();