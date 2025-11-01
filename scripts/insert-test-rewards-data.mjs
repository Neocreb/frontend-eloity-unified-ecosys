#!/usr/bin/env node
/* Insert test data into rewards tables for development and testing */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Validate environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for full access
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTestUsers() {
  console.log('Inserting test users...');
  
  // Check if test users already exist
  const { data: existingUsers, error: usersError } = await supabase
    .from('users')
    .select('id')
    .in('email', ['testuser1@example.com', 'testuser2@example.com']);
  
  if (usersError) {
    console.error('Error checking existing users:', usersError);
    return;
  }
  
  // If users don't exist, create them
  if (!existingUsers || existingUsers.length === 0) {
    const { data: authUsers, error: authError } = await supabase.auth.admin.createUser({
      email: 'testuser1@example.com',
      password: 'TestPass123!',
      email_confirm: true
    });
    
    if (authError) {
      console.error('Error creating test user:', authError);
      return;
    }
    
    console.log('Created test user:', authUsers.user.id);
    return [authUsers.user.id];
  }
  
  return existingUsers.map(user => user.id);
}

async function insertTestRewardRules() {
  console.log('Inserting test reward rules...');
  
  const rules = [
    { action: 'post_creation', base_reward: 10.00, multiplier: 1.0, is_active: true },
    { action: 'post_like', base_reward: 1.00, multiplier: 1.0, is_active: true },
    { action: 'post_comment', base_reward: 2.00, multiplier: 1.0, is_active: true },
    { action: 'referral_signup', base_reward: 50.00, multiplier: 1.0, is_active: true },
    { action: 'daily_login', base_reward: 5.00, multiplier: 1.0, is_active: true }
  ];
  
  const { data, error } = await supabase
    .from('reward_rules')
    .upsert(rules, { onConflict: 'action' });
  
  if (error) {
    console.error('Error inserting reward rules:', error);
  } else {
    console.log('Inserted/updated reward rules');
  }
}

async function insertTestVirtualGifts() {
  console.log('Inserting test virtual gifts...');
  
  const gifts = [
    { 
      id: 'rose', 
      name: 'Rose', 
      emoji: '🌹', 
      price: 5.00, 
      currency: 'USD', 
      category: 'basic', 
      rarity: 'common',
      available: true
    },
    { 
      id: 'chocolate', 
      name: 'Chocolate', 
      emoji: '🍫', 
      price: 10.00, 
      currency: 'USD', 
      category: 'basic', 
      rarity: 'common',
      available: true
    },
    { 
      id: 'diamond', 
      name: 'Diamond', 
      emoji: '💎', 
      price: 50.00, 
      currency: 'USD', 
      category: 'premium', 
      rarity: 'rare',
      available: true
    },
    { 
      id: 'crown', 
      name: 'Crown', 
      emoji: '👑', 
      price: 100.00, 
      currency: 'USD', 
      category: 'special', 
      rarity: 'epic',
      available: true
    }
  ];
  
  const { data, error } = await supabase
    .from('virtual_gifts')
    .upsert(gifts, { onConflict: 'id' });
  
  if (error) {
    console.error('Error inserting virtual gifts:', error);
  } else {
    console.log('Inserted/updated virtual gifts');
  }
}

export async function main() {
  try {
    console.log('Starting test data insertion...');
    
    // Insert test data
    await insertTestRewardRules();
    await insertTestVirtualGifts();
    
    console.log('Test data insertion completed successfully!');
  } catch (error) {
    console.error('Error during test data insertion:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { insertTestRewardRules, insertTestVirtualGifts };