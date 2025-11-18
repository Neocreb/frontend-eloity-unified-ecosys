import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function checkRLSPolicies() {
  try {
    // Create a Supabase client with service role key for admin access
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('Checking RLS policies for group tables...\n');
    
    // Check policies for group_chat_threads
    console.log('=== group_chat_threads policies ===');
    const { data: threadsPolicies, error: threadsError } = await supabase
      .from('pg_policy')
      .select('*')
      .eq('polrelid', 'group_chat_threads');
    
    if (threadsError) {
      console.log('Error fetching policies for group_chat_threads:', threadsError.message);
    } else {
      threadsPolicies.forEach(policy => {
        console.log(`Policy: ${policy.polname}`);
        console.log(`  Command: ${policy.polcmd}`);
        console.log(`  Qual: ${policy.polqual}`);
        console.log(`  With Check: ${policy.polwithcheck}`);
        console.log('');
      });
    }
    
    // Check policies for group_participants
    console.log('=== group_participants policies ===');
    const { data: participantsPolicies, error: participantsError } = await supabase
      .from('pg_policy')
      .select('*')
      .eq('polrelid', 'group_participants');
    
    if (participantsError) {
      console.log('Error fetching policies for group_participants:', participantsError.message);
    } else {
      participantsPolicies.forEach(policy => {
        console.log(`Policy: ${policy.polname}`);
        console.log(`  Command: ${policy.polcmd}`);
        console.log(`  Qual: ${policy.polqual}`);
        console.log(`  With Check: ${policy.polwithcheck}`);
        console.log('');
      });
    }
    
    // Check policies for group_messages
    console.log('=== group_messages policies ===');
    const { data: messagesPolicies, error: messagesError } = await supabase
      .from('pg_policy')
      .select('*')
      .eq('polrelid', 'group_messages');
    
    if (messagesError) {
      console.log('Error fetching policies for group_messages:', messagesError.message);
    } else {
      messagesPolicies.forEach(policy => {
        console.log(`Policy: ${policy.polname}`);
        console.log(`  Command: ${policy.polcmd}`);
        console.log(`  Qual: ${policy.polqual}`);
        console.log(`  With Check: ${policy.polwithcheck}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error checking RLS policies:', error.message);
  }
}

checkRLSPolicies();