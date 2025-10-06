import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking if tables exist...');
  
  const tables = [
    'feed_posts',
    'feed_post_likes',
    'feed_post_comments',
    'crypto_prices',
    'p2p_offers',
    'user_follows'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
        
      if (error) {
        console.log(`✗ ${table}: ${error.message}`);
      } else {
        console.log(`✓ ${table}: accessible`);
      }
    } catch (err) {
      console.log(`✗ ${table}: ${err.message}`);
    }
  }
}

checkTables();