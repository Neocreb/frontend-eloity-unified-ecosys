// Script to create tables directly using Supabase client
import dotenv from 'dotenv';
dotenv.config();

async function createTablesDirect() {
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
    
    // Try to create tables using the Supabase client
    console.log('Creating chat_ads table...');
    
    // Since we can't execute raw SQL, let's try to insert a record which might create the table
    // This is a workaround since we don't have direct SQL execution permissions
    
    const testAd = {
      sponsor: "Test Ad",
      title: "Test Ad Title",
      body: "Test ad body",
      image_url: "https://example.com/image.jpg",
      cta_label: "Click Here",
      cta_url: "https://example.com",
      is_active: true,
      priority: 1
    };
    
    const { data, error } = await supabase
      .from('chat_ads')
      .insert(testAd);
    
    if (error) {
      console.log('❌ Error creating table or inserting data:', error.message);
      console.log('This might be because we don\'t have permission to create tables directly.');
      console.log('You may need to create the tables through the Supabase dashboard.');
    } else {
      console.log('✅ Successfully inserted test data');
      console.log('Data:', data);
    }
    
    // Let's also try to create a simpler approach by checking if we can access the table now
    console.log('\nTesting table access after insert attempt...');
    const { data: testData, error: testError } = await supabase
      .from('chat_ads')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log('❌ Still cannot access chat_ads table:', testError.message);
    } else {
      console.log('✅ Successfully accessed chat_ads table');
      console.log('Test data:', testData);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nNote: It seems we don\'t have permissions to create tables directly.');
    console.log('You may need to create the tables through the Supabase dashboard or use the Supabase SQL editor.');
  }
}

createTablesDirect();