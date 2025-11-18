import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function testGroupTables() {
  try {
    // Create a Supabase client with service role key
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('Testing group_chat_threads table...');
    const { data: threadsData, error: threadsError } = await supabase
      .from('group_chat_threads')
      .select('id')
      .limit(1);
    
    if (threadsError) {
      console.log('❌ group_chat_threads table error:', threadsError.message);
    } else {
      console.log('✅ group_chat_threads table exists');
    }
    
    console.log('Testing group_participants table...');
    const { data: participantsData, error: participantsError } = await supabase
      .from('group_participants')
      .select('id')
      .limit(1);
    
    if (participantsError) {
      console.log('❌ group_participants table error:', participantsError.message);
    } else {
      console.log('✅ group_participants table exists');
    }
    
    console.log('Testing group_messages table...');
    const { data: messagesData, error: messagesError } = await supabase
      .from('group_messages')
      .select('id')
      .limit(1);
    
    if (messagesError) {
      console.log('❌ group_messages table error:', messagesError.message);
    } else {
      console.log('✅ group_messages table exists');
    }
    
  } catch (error) {
    console.error('Supabase connection error:', error.message);
  }
}

testGroupTables();