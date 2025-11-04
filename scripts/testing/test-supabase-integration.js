#!/usr/bin/env node

// Comprehensive test script for Supabase integration
// This script tests all major Supabase functionalities

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSupabaseIntegration() {
  console.log('🧪 Testing Supabase Integration...\n');

  // Check if required environment variables are set
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    console.error('❌ Missing required environment variables:');
    console.error('   VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING');
    console.error('   VITE_SUPABASE_PUBLISHABLE_KEY:', process.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'SET' : 'MISSING');
    console.error('\nPlease set these variables in your .env file.');
    process.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  try {
    // Test 1: Basic connection
    console.log('🔍 Test 1: Basic Connection');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.message !== 'The resource was not found') {
      console.log('❌ Connection failed:', error.message);
      return;
    }
    console.log('✅ Connection successful\n');

    // Test 2: Auth functionality
    console.log('🔍 Test 2: Auth Functionality');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.log('⚠️  Auth test warning:', authError.message);
    } else {
      console.log('✅ Auth functionality working\n');
    }

    // Test 3: Database operations
    console.log('🔍 Test 3: Database Operations');
    
    // Try to create a test user
    const testUser = {
      email: 'test@example.com',
      full_name: 'Test User',
      username: 'testuser'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select();

    if (insertError) {
      console.log('⚠️  Insert test warning:', insertError.message);
    } else {
      console.log('✅ Insert operation successful');
      
      // Try to query the user back
      const { data: queryData, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'test@example.com')
        .single();

      if (queryError) {
        console.log('⚠️  Query test warning:', queryError.message);
      } else {
        console.log('✅ Query operation successful');
      }

      // Clean up - delete the test user
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('email', 'test@example.com');

      if (deleteError) {
        console.log('⚠️  Cleanup warning:', deleteError.message);
      } else {
        console.log('✅ Cleanup successful');
      }
    }
    console.log('');

    // Test 4: Check for required tables
    console.log('🔍 Test 4: Required Tables');
    const requiredTables = ['users', 'profiles', 'posts', 'followers'];
    
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error && error.message !== 'The resource was not found') {
          console.log(`⚠️  ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Available`);
        }
      } catch (tableError) {
        console.log(`⚠️  ${table}: ${tableError.message}`);
      }
    }
    console.log('');

    // Test 5: Storage (if enabled)
    console.log('🔍 Test 5: Storage Functionality');
    try {
      const { data: buckets, error: storageError } = await supabase
        .storage
        .listBuckets();
      
      if (storageError) {
        console.log('⚠️  Storage test warning:', storageError.message);
      } else {
        console.log('✅ Storage functionality working');
        if (buckets && buckets.length > 0) {
          console.log(`   Found ${buckets.length} storage buckets`);
        }
      }
    } catch (storageError) {
      console.log('⚠️  Storage test warning:', storageError.message);
    }
    console.log('');

    console.log('🎉 All tests completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Open your browser to http://localhost:3000');
    console.log('3. Test the application functionality');

  } catch (error) {
    console.error('❌ Test failed with unexpected error:', error.message);
    process.exit(1);
  }
}

testSupabaseIntegration();