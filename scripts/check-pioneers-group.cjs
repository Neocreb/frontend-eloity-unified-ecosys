#!/usr/bin/env node

// Node.js script to check if the Pioneers group exists
// This script can be run directly with Node.js

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

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

async function checkPioneersGroup() {
  try {
    console.log('Checking if Pioneers group exists...');
    
    // Check if the group exists
    const { data: existingGroups, error } = await supabase
      .from('group_chat_threads')
      .select('*')
      .eq('name', 'Pioneers');
      
    if (error) {
      console.error('Error checking for existing group:', error);
      return;
    }
    
    if (existingGroups && existingGroups.length > 0) {
      console.log('✅ Pioneers group found!');
      console.log('ID:', existingGroups[0].id);
      console.log('Name:', existingGroups[0].name);
      console.log('Description:', existingGroups[0].description);
      console.log('Privacy:', existingGroups[0].privacy);
      console.log('Created by:', existingGroups[0].created_by);
      console.log('Created at:', existingGroups[0].created_at);
    } else {
      console.log('❌ Pioneers group not found');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
checkPioneersGroup();