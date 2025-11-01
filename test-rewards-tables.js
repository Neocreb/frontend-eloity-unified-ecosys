#!/usr/bin/env node
/* Test if rewards tables exist and have data */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Validate environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRewardsTables() {
  try {
    console.log('Testing rewards tables...');
    
    // Test if reward_rules table exists and has data
    console.log('Checking reward_rules table...');
    const { data: rules, error: rulesError } = await supabase
      .from('reward_rules')
      .select('*')
      .limit(5);
    
    if (rulesError) {
      console.error('Error fetching reward rules:', rulesError);
    } else {
      console.log('Found reward rules:', rules?.length || 0);
      if (rules && rules.length > 0) {
        console.log('Sample rule:', rules[0]);
      }
    }
    
    // Test if virtual_gifts table exists and has data
    console.log('Checking virtual_gifts table...');
    const { data: gifts, error: giftsError } = await supabase
      .from('virtual_gifts')
      .select('*')
      .limit(5);
    
    if (giftsError) {
      console.error('Error fetching virtual gifts:', giftsError);
    } else {
      console.log('Found virtual gifts:', gifts?.length || 0);
      if (gifts && gifts.length > 0) {
        console.log('Sample gift:', gifts[0]);
      }
    }
    
    console.log('Rewards tables test completed!');
  } catch (error) {
    console.error('Error testing rewards tables:', error);
  }
}

testRewardsTables();