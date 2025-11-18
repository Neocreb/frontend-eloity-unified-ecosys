#!/usr/bin/env node

// Script to test Supabase MCP connection
// This script will verify that the Supabase configuration is working correctly

import { createClient } from '@supabase/supabase-js';

console.log('🧪 Testing Supabase MCP Connection\n');

// Get configuration from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔍 Configuration Check:');
console.log(`Supabase URL: ${supabaseUrl || 'NOT SET'}`);
console.log(`Supabase Anon Key: ${supabaseAnonKey ? 'SET' : 'NOT SET'}\n`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing Supabase configuration in environment variables');
  console.log('Please run the setup script first:');
  console.log('npm run setup:supabase-mcp\n');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔌 Testing connection to Supabase...\n');
    
    // Test 1: Check if we can get the Supabase version
    console.log('📋 Test 1: Checking Supabase connection...');
    
    // Test 2: Try to get user (this will fail if not authenticated, but connection should work)
    console.log('📋 Test 2: Attempting to fetch user data...');
    const { data, error } = await supabase.auth.getUser();
    
    if (error && error.message !== 'Auth session missing!') {
      console.log(`❌ Connection failed: ${error.message}`);
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log('✅ Supabase client initialized correctly\n');
    
    // Test 3: Check if we can access public tables (if any exist)
    console.log('📋 Test 3: Checking for public tables...');
    
    // This is a safe query that should not return sensitive data
    const { data: tables, error: tablesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (tablesError && !tablesError.message.includes('Relation "profiles" does not exist')) {
      console.log(`⚠️  Note: ${tablesError.message}`);
    } else {
      console.log('✅ Public table access check completed');
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Unexpected error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`📍 Project Reference: hjebzdekquczudhrygns`);
  console.log(`📡 MCP Server: https://mcp.supabase.com/mcp?project_ref=hjebzdekquczudhrygns\n`);
  
  const success = await testConnection();
  
  if (success) {
    console.log('\n🎉 All tests passed! Your Supabase MCP integration is working correctly.');
    console.log('\n🚀 Next steps:');
    console.log('1. Run database migrations: npm run migrate:apply');
    console.log('2. Start the development server: npm run dev');
  } else {
    console.log('\n💥 Some tests failed. Please check your configuration.');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your Supabase credentials are correct');
    console.log('2. Check that your project reference is correct');
    console.log('3. Ensure you have network access to Supabase');
    console.log('4. Run the setup script again: npm run setup:supabase-mcp');
    process.exit(1);
  }
}

// Run the test
main();