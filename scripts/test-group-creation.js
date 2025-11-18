// Script to test group creation
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing group creation...');

// Check if Supabase credentials are set
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.log('❌ Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file');
  process.exit(1);
}

console.log('✅ Supabase credentials found');

// Connect to Supabase
try {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  console.log('✅ Connected to Supabase');

  // Try to sign in a test user or create one
  console.log('Signing in test user...');
  
  // You would need to replace these with actual test credentials
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'testpassword'
  });

  if (authError) {
    console.log('❌ Authentication error:', authError.message);
    console.log('Please make sure you have a test user account set up');
    process.exit(1);
  }

  console.log('✅ Authenticated as:', authData.user.email);
  console.log('User ID:', authData.user.id);

  // Test the group creation function directly
  console.log('Testing group creation function...');
  
  const testGroupData = {
    name: 'Test Group',
    description: 'A test group for debugging',
    participants: [authData.user.id], // Just the creator for now
    settings: {
      isPrivate: false
    }
  };

  // Call the function endpoint
  const functionUrl = `${process.env.VITE_SUPABASE_URL}/functions/v1/create-group-with-participants`;
  
  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authData.session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testGroupData)
  });

  console.log('Response status:', response.status);
  
  const responseText = await response.text();
  console.log('Response body:', responseText);
  
  if (response.ok) {
    console.log('✅ Group creation successful!');
    const result = JSON.parse(responseText);
    console.log('Group ID:', result.group.id);
  } else {
    console.log('❌ Group creation failed');
    try {
      const errorResult = JSON.parse(responseText);
      console.log('Error details:', errorResult);
    } catch (e) {
      console.log('Raw error response:', responseText);
    }
  }

} catch (error) {
  console.log('❌ Error:', error.message);
  console.log('Stack trace:', error.stack);
}