import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function exploreDatabase() {
  try {
    console.log('Exploring database structure...\n');
    
    // Create a Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // List all tables
    console.log('1. Listing available tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_schema, table_name')
      .in('table_schema', ['public', 'auth'])
      .order('table_schema')
      .order('table_name');
    
    if (tablesError) {
      console.log('❌ Error fetching tables:', tablesError.message);
    } else {
      console.log('✅ Available tables:');
      const groupedTables = {};
      tables.forEach(table => {
        if (!groupedTables[table.table_schema]) {
          groupedTables[table.table_schema] = [];
        }
        groupedTables[table.table_schema].push(table.table_name);
      });
      
      Object.keys(groupedTables).forEach(schema => {
        console.log(`   ${schema}:`);
        groupedTables[schema].forEach(table => {
          console.log(`     - ${table}`);
        });
      });
    }
    
    // Check if we can access the group tables
    console.log('\n2. Checking group tables...');
    
    // Check group_chat_threads
    const { count: threadsCount, error: threadsError } = await supabase
      .from('group_chat_threads')
      .select('*', { count: 'exact', head: true });
    
    if (threadsError) {
      console.log('❌ Error accessing group_chat_threads:', threadsError.message);
    } else {
      console.log(`✅ group_chat_threads table accessible, ${threadsCount} records`);
    }
    
    // Check group_participants
    const { count: participantsCount, error: participantsError } = await supabase
      .from('group_participants')
      .select('*', { count: 'exact', head: true });
    
    if (participantsError) {
      console.log('❌ Error accessing group_participants:', participantsError.message);
    } else {
      console.log(`✅ group_participants table accessible, ${participantsCount} records`);
    }
    
    // Check group_messages
    const { count: messagesCount, error: messagesError } = await supabase
      .from('group_messages')
      .select('*', { count: 'exact', head: true });
    
    if (messagesError) {
      console.log('❌ Error accessing group_messages:', messagesError.message);
    } else {
      console.log(`✅ group_messages table accessible, ${messagesCount} records`);
    }
    
    console.log('\n🎉 Database exploration completed!');
    
  } catch (error) {
    console.error('❌ Error exploring database:', error.message);
  }
}

exploreDatabase();