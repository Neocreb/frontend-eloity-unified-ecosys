#!/usr/bin/env node
/* Test rewards data directly from Supabase */

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

async function testRewardsDirect() {
  try {
    console.log('Testing rewards data directly from Supabase...');
    
    // Test fetching reward rules
    console.log('Fetching reward rules...');
    const { data: rewardRules, error: rulesError } = await supabase
      .from('reward_rules')
      .select('*')
      .limit(2);
    
    if (rulesError) {
      console.error('Error fetching reward rules:', rulesError);
    } else {
      console.log('Found reward rules:', rewardRules?.length || 0);
      if (rewardRules && rewardRules.length > 0) {
        console.log('Sample rule:', rewardRules[0]);
      }
    }
    
    // Test fetching virtual gifts
    console.log('Fetching virtual gifts...');
    const { data: virtualGifts, error: giftsError } = await supabase
      .from('virtual_gifts')
      .select('*')
      .limit(2);
    
    if (giftsError) {
      console.error('Error fetching virtual gifts:', giftsError);
    } else {
      console.log('Found virtual gifts:', virtualGifts?.length || 0);
      if (virtualGifts && virtualGifts.length > 0) {
        console.log('Sample gift:', virtualGifts[0]);
      }
    }
    
    console.log('Direct rewards test completed!');
  } catch (error) {
    console.error('Error testing rewards directly:', error);
  }
}

testRewardsDirect();