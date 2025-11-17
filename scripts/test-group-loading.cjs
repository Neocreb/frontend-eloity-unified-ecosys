#!/usr/bin/env node

// Node.js script to test if the Pioneers group is being loaded correctly
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

async function testGroupLoading() {
  try {
    console.log('Testing group loading...');
    
    // Check if the Pioneers group exists
    const { data: pioneersGroup, error: pioneersError } = await supabase
      .from('group_chat_threads')
      .select('*')
      .eq('name', 'Pioneers');
      
    if (pioneersError) {
      console.error('Error checking for Pioneers group:', pioneersError);
      return;
    }
    
    if (pioneersGroup && pioneersGroup.length > 0) {
      console.log('✅ Pioneers group found!');
      console.log('ID:', pioneersGroup[0].id);
      console.log('Name:', pioneersGroup[0].name);
      console.log('Description:', pioneersGroup[0].description);
      console.log('Privacy:', pioneersGroup[0].privacy);
      console.log('Created by:', pioneersGroup[0].created_by);
      console.log('Created at:', pioneersGroup[0].created_at);
    } else {
      console.log('❌ Pioneers group not found');
    }
    
    // Check all public groups
    const { data: publicGroups, error: publicGroupsError } = await supabase
      .from('group_chat_threads')
      .select('*')
      .eq('privacy', 'public');
      
    if (publicGroupsError) {
      console.error('Error loading public groups:', publicGroupsError);
    } else {
      console.log(`Found ${publicGroups.length} public groups:`);
      publicGroups.forEach(group => {
        console.log(`- ${group.name} (${group.id})`);
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
testGroupLoading();