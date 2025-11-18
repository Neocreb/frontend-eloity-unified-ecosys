// Test script for the create-group-with-participants function
// This script tests the deployed Supabase function

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCreateGroupFunction() {
  try {
    console.log('Testing create-group-with-participants function...');
    
    // First, we need to sign in a user to get an access token
    // For this test, we'll create a test user
    console.log('Signing in test user...');
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (authError) {
      console.log('Note: Test user sign in failed. This is expected in a fresh environment.');
      console.log('To fully test the function, you would need to:');
      console.log('1. Create a real user account');
      console.log('2. Sign in with that account');
      console.log('3. Use the access token to call the function');
      console.log('');
      console.log('Function endpoint:', `${supabaseUrl}/functions/v1/create-group-with-participants`);
      console.log('Method: POST');
      console.log('Headers: Authorization: Bearer <access_token>');
      console.log('Headers: Content-Type: application/json');
      console.log('Body: {');
      console.log('  "name": "Test Group",');
      console.log('  "description": "A test group created via function",');
      console.log('  "participants": ["user-uuid-1", "user-uuid-2"]');
      console.log('}');
      return;
    }
    
    const token = authData.session.access_token;
    console.log('Successfully signed in. Access token acquired.');
    
    // Call the function
    const response = await fetch(`${supabaseUrl}/functions/v1/create-group-with-participants`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Group',
        description: 'A test group created via function',
        participants: ['user-uuid-1', 'user-uuid-2'] // Replace with real user UUIDs
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Function call successful!');
      console.log('Group created:', result.group);
    } else {
      console.log('❌ Function call failed:');
      console.log('Status:', response.status);
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('Test failed with error:', error.message);
  }
}

// Run the test
testCreateGroupFunction();