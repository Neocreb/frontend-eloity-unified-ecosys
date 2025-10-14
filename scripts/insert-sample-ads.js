// Script to insert sample ads into the database
import dotenv from 'dotenv';
dotenv.config();

console.log('Inserting sample ads into the database...');

async function insertSampleAds() {
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
    
    // Sample ads data
    const sampleAds = [
      {
        sponsor: "Eloity Crypto",
        title: "Trade Crypto with Zero Fees",
        body: "Join thousands of users trading Bitcoin, Ethereum, and other cryptocurrencies with no transaction fees. Start trading today!",
        image_url: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=60",
        cta_label: "Start Trading",
        cta_url: "https://example.com/crypto",
        priority: 10,
        is_active: true
      },
      {
        sponsor: "Marketplace Pro",
        title: "Sell Your Products Globally",
        body: "List your products on our global marketplace and reach millions of customers worldwide. Low commission rates and fast payouts.",
        image_url: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&q=60",
        cta_label: "List Products",
        cta_url: "https://example.com/marketplace",
        priority: 8,
        is_active: true
      },
      {
        sponsor: "Freelance Hub",
        title: "Find Freelance Work",
        body: "Connect with clients looking for your skills. From web development to graphic design, find the perfect freelance job.",
        image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=60",
        cta_label: "Browse Jobs",
        cta_url: "https://example.com/freelance",
        priority: 6,
        is_active: true
      }
    ];
    
    console.log('Inserting sample ads...');
    
    // Insert the sample ads
    const { data, error } = await supabase
      .from('chat_ads')
      .insert(sampleAds)
      .select();
    
    if (error) {
      console.error('❌ Error inserting sample ads:', error.message);
      process.exit(1);
    }
    
    console.log(`✅ Successfully inserted ${data.length} sample ads`);
    
    // Display the inserted ads
    console.log('\nInserted ads:');
    data.forEach((ad, index) => {
      console.log(`${index + 1}. ${ad.title} by ${ad.sponsor}`);
    });
    
    console.log('\n🎉 Sample ads inserted successfully!');
    console.log('\nYou can now test the admin chat interface with real data.');
    
  } catch (error) {
    console.error('❌ Failed to insert sample ads:', error.message);
    process.exit(1);
  }
}

insertSampleAds();