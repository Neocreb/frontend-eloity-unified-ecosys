// Script to test chat ads functionality
import dotenv from 'dotenv';
dotenv.config();

async function testChatAds() {
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
    
    // Test accessing chat ads
    console.log('Testing chat ads access...');
    const { data: adsData, error: adsError } = await supabase
      .from('chat_ads')
      .select('*')
      .limit(5);
    
    if (adsError) {
      console.log('❌ Error accessing chat_ads:', adsError.message);
    } else {
      console.log(`✅ Successfully accessed chat_ads table with ${adsData.length} records`);
      console.log('Sample ads:');
      adsData.forEach((ad, index) => {
        console.log(`${index + 1}. ${ad.title} by ${ad.sponsor || 'Unknown'}`);
      });
    }
    
    // Test accessing flagged messages
    console.log('\nTesting flagged messages access...');
    const { data: flaggedData, error: flaggedError } = await supabase
      .from('flagged_messages')
      .select('*')
      .limit(5);
    
    if (flaggedError) {
      console.log('❌ Error accessing flagged_messages:', flaggedError.message);
    } else {
      console.log(`✅ Successfully accessed flagged_messages table with ${flaggedData.length} records`);
    }
    
    // Test creating a new ad
    console.log('\nTesting ad creation...');
    const newAd = {
      sponsor: "Test Company",
      title: "Test Ad from Script",
      body: "This is a test ad created from a script",
      image_url: "https://example.com/test-image.jpg",
      cta_label: "Click Me",
      cta_url: "https://example.com",
      is_active: true,
      priority: 5
    };
    
    const { data: createdAd, error: createError } = await supabase
      .from('chat_ads')
      .insert(newAd)
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Error creating ad:', createError.message);
    } else {
      console.log('✅ Successfully created new ad:', createdAd.title);
      
      // Test updating the ad
      console.log('\nTesting ad update...');
      const { data: updatedAd, error: updateError } = await supabase
        .from('chat_ads')
        .update({ title: "Updated Test Ad" })
        .eq('id', createdAd.id)
        .select()
        .single();
      
      if (updateError) {
        console.log('❌ Error updating ad:', updateError.message);
      } else {
        console.log('✅ Successfully updated ad:', updatedAd.title);
      }
      
      // Test deleting the ad
      console.log('\nTesting ad deletion...');
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
    
    console.log('\n🎉 Chat ads functionality test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testChatAds();