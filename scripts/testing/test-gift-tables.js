#!/usr/bin/env node
/* Test if gift-related tables exist and have data with RLS enabled */

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

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseKey);

async function testGiftTables() {
  try {
    console.log('Testing gift-related tables with RLS enabled...');
    
    // Test virtual_gifts table (should be publicly accessible)
    console.log('Checking virtual_gifts table...');
    const { data: virtualGifts, error: virtualGiftsError } = await supabase
      .from('virtual_gifts')
      .select('*')
      .limit(5);
    
    if (virtualGiftsError) {
      console.log('Virtual gifts table error:', virtualGiftsError.message);
    } else {
      console.log('Found virtual gifts:', virtualGifts?.length || 0);
      if (virtualGifts && virtualGifts.length > 0) {
        console.log('Sample gift:', virtualGifts[0]);
      }
    }
    
    // Test gift_transactions table
    console.log('Checking gift_transactions table...');
    const { data: giftTransactions, error: giftTransactionsError } = await supabase
      .from('gift_transactions')
      .select('*')
      .limit(5);
    
    if (giftTransactionsError) {
      console.log('Gift transactions table error:', giftTransactionsError.message);
    } else {
      console.log('Found gift transactions:', giftTransactions?.length || 0);
      if (giftTransactions && giftTransactions.length > 0) {
        console.log('Sample transaction:', giftTransactions[0]);
      }
    }
    
    // Test tip_transactions table
    console.log('Checking tip_transactions table...');
    const { data: tipTransactions, error: tipTransactionsError } = await supabase
      .from('tip_transactions')
      .select('*')
      .limit(5);
    
    if (tipTransactionsError) {
      console.log('Tip transactions table error:', tipTransactionsError.message);
    } else {
      console.log('Found tip transactions:', tipTransactions?.length || 0);
      if (tipTransactions && tipTransactions.length > 0) {
        console.log('Sample tip transaction:', tipTransactions[0]);
      }
    }
    
    // Test user_gift_inventory table
    console.log('Checking user_gift_inventory table...');
    const { data: giftInventory, error: giftInventoryError } = await supabase
      .from('user_gift_inventory')
      .select('*')
      .limit(5);
    
    if (giftInventoryError) {
      console.log('User gift inventory table error:', giftInventoryError.message);
    } else {
      console.log('Found gift inventory records:', giftInventory?.length || 0);
      if (giftInventory && giftInventory.length > 0) {
        console.log('Sample inventory record:', giftInventory[0]);
      }
    }
    
    // Test creator_tip_settings table
    console.log('Checking creator_tip_settings table...');
    const { data: tipSettings, error: tipSettingsError } = await supabase
      .from('creator_tip_settings')
      .select('*')
      .limit(5);
    
    if (tipSettingsError) {
      console.log('Creator tip settings table error:', tipSettingsError.message);
    } else {
      console.log('Found tip settings records:', tipSettings?.length || 0);
      if (tipSettings && tipSettings.length > 0) {
        console.log('Sample tip settings:', tipSettings[0]);
      }
    }
    
    console.log('Gift tables test completed!');
  } catch (error) {
    console.error('Error testing gift tables:', error);
  }
}

testGiftTables();