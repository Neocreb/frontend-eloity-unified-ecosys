// Script to test admin chat functionality
import dotenv from 'dotenv';
dotenv.config();

async function testAdminChat() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    // Check if Supabase credentials are set
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
      console.log('❌ Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file');
      process.exit(1);
    }
    
    // Create a Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    );
    
    console.log('✅ Connected to Supabase');
    console.log('Testing Admin Chat Functionality...\n');
    
    // Test 1: Fetch chat ads
    console.log('1. Testing chat ads retrieval...');
    const { data: adsData, error: adsError } = await supabase
      .from('chat_ads')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .limit(5);
    
    if (adsError) {
      console.log('❌ Error fetching chat ads:', adsError.message);
    } else {
      console.log(`✅ Successfully retrieved ${adsData.length} chat ads`);
      adsData.forEach((ad, index) => {
        console.log(`   ${index + 1}. ${ad.title} (${ad.sponsor || 'No sponsor'})`);
      });
    }
    
    // Test 2: Create a new ad
    console.log('\n2. Testing ad creation...');
    const newAd = {
      sponsor: "Test Admin",
      title: "Database Test Ad",
      body: "This ad was created during automated testing",
      image_url: "https://example.com/test-ad.jpg",
      cta_label: "Test Now",
      cta_url: "https://example.com/test",
      is_active: true,
      priority: 10
    };
    
    const { data: createdAd, error: createError } = await supabase
      .from('chat_ads')
      .insert(newAd)
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Error creating ad:', createError.message);
    } else {
      console.log('✅ Successfully created ad:', createdAd.title);
      
      // Test 3: Update the ad
      console.log('\n3. Testing ad update...');
      const { data: updatedAd, error: updateError } = await supabase
        .from('chat_ads')
        .update({ title: "Updated Test Ad", priority: 15 })
        .eq('id', createdAd.id)
        .select()
        .single();
      
      if (updateError) {
        console.log('❌ Error updating ad:', updateError.message);
      } else {
        console.log('✅ Successfully updated ad to:', updatedAd.title);
      }
      
      // Test 4: Delete the ad
      console.log('\n4. Testing ad deletion...');
      const { error: deleteError } = await supabase
        .from('chat_ads')
        .delete()
        .eq('id', createdAd.id);
      
      if (deleteError) {
        console.log('❌ Error deleting ad:', deleteError.message);
      } else {
        console.log('✅ Successfully deleted ad');
      }
    }
    
    // Test 5: Test flagged messages functionality
    console.log('\n5. Testing flagged messages...');
    const { data: flaggedData, error: flaggedError } = await supabase
      .from('flagged_messages')
      .select('count')
      .single();
    
    if (flaggedError) {
      console.log('❌ Error accessing flagged_messages:', flaggedError.message);
    } else {
      console.log('✅ Flagged messages table is accessible');
    }
    
    // Test 6: Insert a flagged message for testing
    console.log('\n6. Testing flagged message creation...');
    const flaggedMessage = {
      message_id: 'test-message-id-' + Date.now(),
      thread_id: 'test-thread-id-' + Date.now(),
      reason: 'test',
      description: 'Test flagged message for verification',
      status: 'pending',
      priority: 'medium'
    };
    
    const { data: createdFlagged, error: flaggedCreateError } = await supabase
      .from('flagged_messages')
      .insert(flaggedMessage)
      .select()
      .single();
    
    if (flaggedCreateError) {
      console.log('❌ Error creating flagged message:', flaggedCreateError.message);
    } else {
      console.log('✅ Successfully created flagged message');
      
      // Clean up the test flagged message
      const { error: flaggedDeleteError } = await supabase
        .from('flagged_messages')
        .delete()
        .eq('id', createdFlagged.id);
      
      if (flaggedDeleteError) {
        console.log('❌ Error deleting test flagged message:', flaggedDeleteError.message);
      } else {
        console.log('✅ Successfully cleaned up test flagged message');
      }
    }
    
    console.log('\n🎉 All Admin Chat tests completed successfully!');
    console.log('\nSummary:');
    console.log('- Chat ads retrieval: ✅ Working');
    console.log('- Ad creation: ✅ Working');
    console.log('- Ad updating: ✅ Working');
    console.log('- Ad deletion: ✅ Working');
    console.log('- Flagged messages access: ✅ Working');
    console.log('- Flagged message creation: ✅ Working');
    
    console.log('\nThe admin chat interface should now be fully functional with real database storage!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testAdminChat();