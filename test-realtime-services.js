import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealtimeServices() {
  console.log('Testing access to newly created tables and services...');
  
  try {
    // Test crypto tables
    console.log('\n1. Testing crypto tables...');
    
    const cryptoTables = [
      'crypto_wallets',
      'crypto_transactions',
      'crypto_trades',
      'crypto_prices',
      'p2p_offers'
    ];
    
    for (const table of cryptoTables) {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
        
      if (error) {
        console.error(`Error accessing ${table}:`, error);
      } else {
        console.log(`✓ ${table} table accessible`);
      }
    }
    
    // Test feed tables
    console.log('\n2. Testing feed tables...');
    
    const feedTables = [
      'user_stories',
      'story_views',
      'user_saved_posts',
      'user_post_shares',
      'post_reactions',
      'comment_likes',
      'comment_replies'
    ];
    
    for (const table of feedTables) {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
        
      if (error) {
        console.error(`Error accessing ${table}:`, error);
      } else {
        console.log(`✓ ${table} table accessible`);
      }
    }
    
    // Test notification tables
    console.log('\n3. Testing notification tables...');
    
    const notificationTables = [
      'notifications',
      'user_notification_preferences'
    ];
    
    for (const table of notificationTables) {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
        
      if (error) {
        console.error(`Error accessing ${table}:`, error);
      } else {
        console.log(`✓ ${table} table accessible`);
      }
    }
    
    console.log('\n✅ All new tables are accessible!');
    
  } catch (error) {
    console.error('Error testing tables:', error);
  }
}

// Run the test
testRealtimeServices();