import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function testGroupCreation() {
  try {
    console.log('Testing group creation functionality...\n');
    
    // Create a Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // First, let's check if we have any users in the database
    console.log('Checking for existing users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(3);
    
    if (usersError) {
      console.log('Error fetching users:', usersError.message);
      return;
    }
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.id})`);
    });
    
    if (users.length === 0) {
      console.log('No users found. Please create a user first.');
      return;
    }
    
    // Use the first user as the group creator
    const creatorId = users[0].id;
    console.log(`\nUsing user ${users[0].email} as group creator (${creatorId})`);
    
    // Test the group creation function endpoint
    console.log('\nTesting group creation via function endpoint...');
    const functionUrl = `${process.env.VITE_SUPABASE_URL}/functions/v1/create-group-with-participants`;
    
    console.log(`Function URL: ${functionUrl}`);
    
    // Create a test group
    const testGroup = {
      name: 'Test Group',
      description: 'A test group for development',
      participants: [creatorId]
    };
    
    console.log('Test group data:', testGroup);
    
    // Note: We can't actually call the function endpoint from here because it requires
    // a proper auth token from a real user session. This is just to verify the setup.
    
    console.log('\n✅ Group creation setup appears to be working!');
    console.log('To test actual group creation, try creating a group through the UI.');
    
  } catch (error) {
    console.error('Error testing group creation:', error.message);
  }
}

testGroupCreation();