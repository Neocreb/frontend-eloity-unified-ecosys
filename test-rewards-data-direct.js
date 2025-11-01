#!/usr/bin/env node
/* Test rewards data directly from Supabase */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Validate environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRewardsDataDirect() {
  try {
    console.log('Testing rewards data directly from Supabase...');
    
    // Test fetching challenges
    console.log('Fetching challenges...');
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .limit(2);
    
    if (challengesError) {
      console.error('Error fetching challenges:', challengesError);
    } else {
      console.log('Found challenges:', challenges?.length || 0);
      if (challenges && challenges.length > 0) {
        console.log('Sample challenge:', challenges[0]);
      }
    }
    
    // Test fetching user challenge progress
    console.log('Fetching user challenge progress...');
    const { data: progress, error: progressError } = await supabase
      .from('user_challenge_progress')
      .select('*')
      .limit(2);
    
    if (progressError) {
      console.log('User challenge progress error (may be empty):', progressError.message);
    } else {
      console.log('Found user challenge progress records:', progress?.length || 0);
      if (progress && progress.length > 0) {
        console.log('Sample user challenge progress:', progress[0]);
      }
    }
    
    // Test fetching battles
    console.log('Fetching battles...');
    const { data: battles, error: battlesError } = await supabase
      .from('live_battles')
      .select('*')
      .limit(2);
    
    if (battlesError) {
      console.log('Battles error (may be empty):', battlesError.message);
    } else {
      console.log('Found battles:', battles?.length || 0);
      if (battles && battles.length > 0) {
        console.log('Sample battle:', battles[0]);
      }
    }
    
    // Test fetching battle votes
    console.log('Fetching battle votes...');
    const { data: votes, error: votesError } = await supabase
      .from('battle_votes')
      .select('*')
      .limit(2);
    
    if (votesError) {
      console.log('Battle votes error (may be empty):', votesError.message);
    } else {
      console.log('Found battle votes:', votes?.length || 0);
      if (votes && votes.length > 0) {
        console.log('Sample battle vote:', votes[0]);
      }
    }
    
    console.log('Direct rewards data test completed!');
  } catch (error) {
    console.error('Error testing rewards data directly:', error);
  }
}

testRewardsDataDirect();