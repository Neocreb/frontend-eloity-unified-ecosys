#!/usr/bin/env node
/* Test challenges and battles data */

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

async function testChallengesData() {
  try {
    console.log('Testing challenges and battles data...');
    
    // Test fetching simple challenges
    console.log('Fetching simple challenges...');
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .limit(5);
    
    if (challengesError) {
      console.log('Challenges error:', challengesError.message);
    } else {
      console.log('Found challenges:', challenges?.length || 0);
      if (challenges && challenges.length > 0) {
        console.log('Sample challenge:', challenges[0]);
      }
    }
    
    // Test fetching duet challenges
    console.log('Fetching duet challenges...');
    const { data: duetChallenges, error: duetChallengesError } = await supabase
      .from('duet_challenges')
      .select('*')
      .limit(5);
    
    if (duetChallengesError) {
      console.log('Duet challenges error:', duetChallengesError.message);
    } else {
      console.log('Found duet challenges:', duetChallenges?.length || 0);
      if (duetChallenges && duetChallenges.length > 0) {
        console.log('Sample duet challenge:', duetChallenges[0]);
      }
    }
    
    // Test fetching battles
    console.log('Fetching battles...');
    const { data: battles, error: battlesError } = await supabase
      .from('battles')
      .select('*')
      .limit(5);
    
    if (battlesError) {
      console.log('Battles error:', battlesError.message);
    } else {
      console.log('Found battles:', battles?.length || 0);
      if (battles && battles.length > 0) {
        console.log('Sample battle:', battles[0]);
      }
    }
    
    // Test fetching live battles
    console.log('Fetching live battles...');
    const { data: liveBattles, error: liveBattlesError } = await supabase
      .from('live_battles')
      .select('*')
      .limit(5);
    
    if (liveBattlesError) {
      console.log('Live battles error:', liveBattlesError.message);
    } else {
      console.log('Found live battles:', liveBattles?.length || 0);
      if (liveBattles && liveBattles.length > 0) {
        console.log('Sample live battle:', liveBattles[0]);
      }
    }
    
    // Test fetching daily challenges
    console.log('Fetching daily challenges...');
    const { data: dailyChallenges, error: dailyChallengesError } = await supabase
      .from('daily_challenges')
      .select('*')
      .limit(5);
    
    if (dailyChallengesError) {
      console.log('Daily challenges error:', dailyChallengesError.message);
    } else {
      console.log('Found daily challenges:', dailyChallenges?.length || 0);
      if (dailyChallenges && dailyChallenges.length > 0) {
        console.log('Sample daily challenge:', dailyChallenges[0]);
      }
    }
    
    console.log('Challenges and battles data test completed!');
  } catch (error) {
    console.error('Error testing challenges and battles data:', error);
  }
}

testChallengesData();