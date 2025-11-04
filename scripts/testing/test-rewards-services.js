#!/usr/bin/env node
/* Test rewards challenges and battles services */

import dotenv from 'dotenv';
import { rewardsChallengesService } from './src/services/rewardsChallengesService.js';
import { rewardsBattlesService } from './src/services/rewardsBattlesService.js';

// Load environment variables
dotenv.config();

async function testRewardsServices() {
  try {
    console.log('Testing rewards challenges and battles services...');
    
    // Test fetching challenges
    console.log('Fetching challenges...');
    const challenges = await rewardsChallengesService.getActiveChallenges();
    console.log('Found challenges:', challenges?.length || 0);
    if (challenges && challenges.length > 0) {
      console.log('Sample challenge:', challenges[0]);
    }
    
    // Test fetching battles
    console.log('Fetching battles...');
    const battles = await rewardsBattlesService.getActiveBattles();
    console.log('Found battles:', battles?.length || 0);
    if (battles && battles.length > 0) {
      console.log('Sample battle:', battles[0]);
    }
    
    console.log('Rewards services test completed!');
  } catch (error) {
    console.error('Error testing rewards services:', error);
  }
}

testRewardsServices();