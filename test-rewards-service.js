#!/usr/bin/env node
/* Test the rewards service functionality */

import dotenv from 'dotenv';
import { rewardsService } from './src/services/rewardsService.ts';

// Load environment variables
dotenv.config();

async function testRewardsService() {
  try {
    console.log('Testing rewards service...');
    
    // Test fetching reward rules
    console.log('Fetching reward rules...');
    const rules = await rewardsService.getRewardRules();
    console.log('Reward rules:', rules);
    
    // Test fetching virtual gifts
    console.log('Fetching virtual gifts...');
    const gifts = await rewardsService.getVirtualGifts();
    console.log('Virtual gifts:', gifts);
    
    console.log('Rewards service test completed successfully!');
  } catch (error) {
    console.error('Error testing rewards service:', error);
  }
}

testRewardsService();