#!/usr/bin/env node

// Node.js script to create the Pioneers group using environment variables
// This script can be run directly with Node.js

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  console.error('Required variables: VITE_SUPABASE_URL, and either SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function createPioneersGroup() {
  try {
    console.log('Creating Pioneers group...');
    
    // Check if the group already exists
    const { data: existingGroups, error: selectError } = await supabase
      .from('group_chat_threads')
      .select('*')
      .eq('name', 'Pioneers');
      
    if (selectError) {
      console.error('Error checking for existing group:', selectError);
      return;
    }
    
    if (existingGroups && existingGroups.length > 0) {
      console.log('Pioneers group already exists with ID:', existingGroups[0].id);
      return;
    }
    
    // Use the admin user ID as the creator
    const adminUserId = '4211e864-4051-4404-b8b7-60d937b8631c';
    
    // Create the Pioneers group
    const groupId = uuidv4();
    const { data: newGroup, error: insertError } = await supabase
      .from('group_chat_threads')
      .insert({
        id: groupId,
        name: 'Pioneers',
        description: 'A public group for all pioneers to connect, share ideas, and collaborate. Join us!',
        avatar: '',
        privacy: 'public',
        member_count: 0,
        post_count: 0,
        category: 'community',
        created_by: adminUserId, // Use the admin user ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating Pioneers group:', insertError);
      return;
    }

    console.log('Successfully created Pioneers group with ID:', newGroup.id);
    
    // Also create an initial welcome message
    const { error: messageError } = await supabase
      .from('group_messages')
      .insert({
        id: uuidv4(),
        thread_id: newGroup.id,
        sender_id: adminUserId, // Use the admin user ID as sender
        content: 'Welcome to the Pioneers group! This is a public community space for all pioneers to connect and collaborate.',
        type: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (messageError) {
      console.error('Error creating welcome message:', messageError);
    } else {
      console.log('Successfully created welcome message');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
createPioneersGroup();