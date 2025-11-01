#!/usr/bin/env node
/* Test rewards data structure */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Validate environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRewardsDataStructure() {
  try {
    console.log('Testing rewards data structure...');
    
    // Test if user_rewards table has data
    console.log('Checking user_rewards table structure...');
    const { data: userRewards, error: userRewardsError } = await supabase
      .from('user_rewards')
      .select('*')
      .limit(1);
    
    if (userRewardsError) {
      console.log('User rewards table error:', userRewardsError.message);
    } else {
      console.log('User rewards sample:', userRewards?.[0] || 'No data found');
    }
    
    // Test if reward_rules table has data
    console.log('Checking reward_rules table structure...');
    const { data: rewardRules, error: rewardRulesError } = await supabase
      .from('reward_rules')
      .select('*')
      .limit(1);
    
    if (rewardRulesError) {
      console.log('Reward rules table error:', rewardRulesError.message);
    } else {
      console.log('Reward rules sample:', rewardRules?.[0] || 'No data found');
    }
    
    console.log('Rewards data structure test completed!');
  } catch (error) {
    console.error('Error testing rewards data structure:', error);
  }
}

testRewardsDataStructure();