// Simple script to test if we can get function logs
console.log('Testing function logs...');

// You'll need to replace these with actual values
const SUPABASE_URL = 'https://hjebzdekquczudhrygns.supabase.co';
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE'; // Get this from a logged in user session
const USER_ID = 'YOUR_USER_ID_HERE'; // Get this from the logged in user

async function testFunctionLogs() {
  try {
    console.log('Calling function to generate logs...');
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-group-with-participants`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Group for Logs',
        description: 'Testing function logs',
        participants: [USER_ID], // Just the creator for now
        settings: {
          isPrivate: false
        }
      })
    });

    console.log('Response status:', response.status);
    
    try {
      const result = await response.json();
      console.log('Response body:', result);
    } catch (e) {
      console.log('Response text:', await response.text());
    }
    
  } catch (error) {
    console.error('Error calling function:', error);
  }
}

testFunctionLogs();