// Script to test group contributions functionality
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing group contributions functionality...');

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

  // Check if the user is a member of any groups
  console.log('Checking group memberships...');
  
  const { data: groupMemberships, error: membershipError } = await supabase
    .from('group_members')
    .select('group_id, groups(name)')
    .eq('user_id', authData.user.id);

  if (membershipError) {
    console.log('❌ Error fetching group memberships:', membershipError.message);
    process.exit(1);
  }

  console.log(`Found ${groupMemberships.length} group memberships:`);
  groupMemberships.forEach(membership => {
    console.log(`  - ${membership.groups?.name || 'Unknown Group'} (${membership.group_id})`);
  });

  if (groupMemberships.length === 0) {
    console.log('⚠️  User is not a member of any groups. Cannot test contributions.');
    console.log('Please join a group first to test contributions.');
    process.exit(0);
  }

  // Use the first group for testing
  const testGroupId = groupMemberships[0].group_id;
  const testGroupName = groupMemberships[0].groups?.name || 'Unknown Group';
  
  console.log(`\nUsing group "${testGroupName}" (${testGroupId}) for testing`);

  // Test creating a contribution
  console.log('\nTesting contribution creation...');
  
  const testContribution = {
    group_id: testGroupId,
    title: 'Test Contribution',
    description: 'A test contribution for development',
    type: 'fixed',
    target_amount: 100,
    currency: 'ELOITY'
  };

  const { data: contributionData, error: contributionError } = await supabase
    .from('group_contributions')
    .insert(testContribution)
    .select()
    .single();

  if (contributionError) {
    console.log('❌ Error creating contribution:', contributionError.message);
    console.log('This might be due to RLS policies or missing permissions.');
  } else {
    console.log('✅ Contribution created successfully!');
    console.log('Contribution ID:', contributionData.id);
    
    // Test contributing to the contribution
    console.log('\nTesting contribution to contribution...');
    
    const testContributionAmount = {
      contribution_id: contributionData.id,
      user_id: authData.user.id,
      amount: 10,
      currency: 'ELOITY'
    };

    const { data: contributorData, error: contributorError } = await supabase
      .from('group_contributors')
      .insert(testContributionAmount)
      .select()
      .single();

    if (contributorError) {
      console.log('❌ Error contributing:', contributorError.message);
    } else {
      console.log('✅ Contribution successful!');
      console.log('Contributor ID:', contributorData.id);
      
      // Clean up by deleting the test contribution
      console.log('\nCleaning up test data...');
      
      const { error: deleteError } = await supabase
        .from('group_contributors')
        .delete()
        .eq('id', contributorData.id);

      if (deleteError) {
        console.log('⚠️  Warning: Could not delete test contributor record:', deleteError.message);
      } else {
        console.log('✅ Test contributor record deleted');
      }

      const { error: deleteContributionError } = await supabase
        .from('group_contributions')
        .delete()
        .eq('id', contributionData.id);

      if (deleteContributionError) {
        console.log('⚠️  Warning: Could not delete test contribution:', deleteContributionError.message);
      } else {
        console.log('✅ Test contribution deleted');
      }
    }
  }

  console.log('\n🎉 Group contributions test completed!');

} catch (error) {
  console.log('❌ Error:', error.message);
  console.log('Stack trace:', error.stack);
}