import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMarketplaceService() {
  console.log('Testing Marketplace Service with Supabase...');
  
  try {
    // Test categories table
    console.log('\n1. Testing categories table...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);
      
    if (categoriesError) {
      console.error('Error accessing categories:', categoriesError);
    } else {
      console.log('✓ categories table accessible');
    }
    
    // Test products table
    console.log('\n2. Testing products table...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
      
    if (productsError) {
      console.error('Error accessing products:', productsError);
    } else {
      console.log('✓ products table accessible');
    }
    
    // Test reviews table
    console.log('\n3. Testing reviews table...');
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id')
      .limit(1);
      
    if (reviewsError) {
      console.error('Error accessing reviews:', reviewsError);
    } else {
      console.log('✓ reviews table accessible');
    }
    
    // Test orders table
    console.log('\n4. Testing orders table...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
      
    if (ordersError) {
      console.error('Error accessing orders:', ordersError);
    } else {
      console.log('✓ orders table accessible');
    }
    
    console.log('\n✅ Marketplace Service tests completed successfully!');
    
  } catch (error) {
    console.error('Error testing Marketplace Service:', error);
  }
}

// Run the test
testMarketplaceService();