// Simple test script to verify the function endpoint is working
console.log('Testing function endpoint...');

// You'll need to replace these with actual values
const SUPABASE_URL = 'https://hjebzdekquczudhrygns.supabase.co';
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE'; // Get this from a logged in user session
const USER_ID = 'YOUR_USER_ID_HERE'; // Get this from the logged in user

async function testFunctionEndpoint() {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-group-with-participants`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Group via Function',
        description: 'Testing the function endpoint',
        participants: [USER_ID], // Just the creator for now
        settings: {
          isPrivate: false
        }
      })
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Function endpoint is working!');
    } else {
      console.log('❌ Function endpoint failed');
    }
  } catch (error) {
    console.error('Error testing function endpoint:', error);
  }
}

testFunctionEndpoint();