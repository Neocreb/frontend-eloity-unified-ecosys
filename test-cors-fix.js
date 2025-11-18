// Test script to verify CORS fix
console.log('Testing CORS fix...');

// Replace with actual values from your authenticated session
const SUPABASE_URL = 'https://hjebzdekquczudhrygns.supabase.co';
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE'; // Get this from a logged in user session
const USER_ID = 'YOUR_USER_ID_HERE'; // Get this from the logged in user

async function testCorsPreflight() {
  try {
    console.log('Testing preflight OPTIONS request...');
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-group-with-participants`, {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization,content-type',
        'Origin': 'https://frontend-eloity-unified-ecosyst.vercel.app'
      }
    });

    console.log('Preflight response status:', response.status);
    console.log('Preflight response headers:', [...response.headers.entries()]);
    
    if (response.status === 204) {
      console.log('✅ Preflight request successful!');
    } else {
      console.log('❌ Preflight request failed');
    }
  } catch (error) {
    console.error('Error testing preflight request:', error);
  }
}

async function testPostRequest() {
  try {
    console.log('Testing POST request...');
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-group-with-participants`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Origin': 'https://frontend-eloity-unified-ecosyst.vercel.app'
      },
      body: JSON.stringify({
        name: 'Test Group CORS Fix',
        description: 'Testing CORS fix',
        participants: [USER_ID],
        settings: {
          isPrivate: false
        }
      })
    });

    console.log('POST response status:', response.status);
    console.log('POST response headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      const result = await response.json();
      console.log('POST response body:', result);
      console.log('✅ POST request successful!');
    } else {
      const error = await response.json();
      console.log('POST error response:', error);
      console.log('❌ POST request failed');
    }
  } catch (error) {
    console.error('Error testing POST request:', error);
  }
}

// Run tests
testCorsPreflight().then(() => {
  console.log('\n---\n');
  return testPostRequest();
});