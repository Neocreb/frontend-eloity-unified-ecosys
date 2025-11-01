#!/usr/bin/env node
/* Test rewards service */

import dotenv from 'dotenv';
import { rewardsService } from './src/services/rewardsService.js';

// Load environment variables
dotenv.config();

async function testRewardsService() {
  try {
    console.log('Testing rewards service...');
    
    // Test fetching reward rules
    console.log('Fetching reward rules...');
    const rewardRules = await rewardsService.getRewardRules();
    console.log('Found reward rules:', rewardRules?.length || 0);
    if (rewardRules && rewardRules.length > 0) {
      console.log('Sample rule:', rewardRules[0]);
    }
    
    // Test fetching virtual gifts
    console.log('Fetching virtual gifts...');
    const virtualGifts = await rewardsService.getVirtualGifts();
    console.log('Found virtual gifts:', virtualGifts?.length || 0);
    if (virtualGifts && virtualGifts.length > 0) {
      console.log('Sample gift:', virtualGifts[0]);
    }
    
    console.log('Rewards service test completed!');
  } catch (error) {
    console.error('Error testing rewards service:', error);
  }
}

testRewardsService();