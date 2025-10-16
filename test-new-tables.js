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

async function testNewTables() {
  console.log('Testing access to newly created tables...');
  
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
    
    // Test order_items table
    console.log('\n5. Testing order_items table...');
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('id')
      .limit(1);
      
    if (orderItemsError) {
      console.error('Error accessing order_items:', orderItemsError);
    } else {
      console.log('✓ order_items table accessible');
    }
    
    // Test feed_posts table
    console.log('\n6. Testing feed_posts table...');
    const { data: feedPosts, error: feedPostsError } = await supabase
      .from('feed_posts')
      .select('id')
      .limit(1);
      
    if (feedPostsError) {
      console.error('Error accessing feed_posts:', feedPostsError);
    } else {
      console.log('✓ feed_posts table accessible');
    }
    
    // Test feed_post_likes table
    console.log('\n7. Testing feed_post_likes table...');
    const { data: feedPostLikes, error: feedPostLikesError } = await supabase
      .from('feed_post_likes')
      .select('id')
      .limit(1);
      
    if (feedPostLikesError) {
      console.error('Error accessing feed_post_likes:', feedPostLikesError);
    } else {
      console.log('✓ feed_post_likes table accessible');
    }
    
    // Test feed_post_comments table
    console.log('\n8. Testing feed_post_comments table...');
    const { data: feedPostComments, error: feedPostCommentsError } = await supabase
      .from('feed_post_comments')
      .select('id')
      .limit(1);
      
    if (feedPostCommentsError) {
      console.error('Error accessing feed_post_comments:', feedPostCommentsError);
    } else {
      console.log('✓ feed_post_comments table accessible');
    }
    
    // Test user_analytics table
    console.log('\n9. Testing user_analytics table...');
    const { data: userAnalytics, error: userAnalyticsError } = await supabase
      .from('user_analytics')
      .select('id')
      .limit(1);
      
    if (userAnalyticsError) {
      console.error('Error accessing user_analytics:', userAnalyticsError);
    } else {
      console.log('✓ user_analytics table accessible');
    }
    
    // Test product_analytics table
    console.log('\n10. Testing product_analytics table...');
    const { data: productAnalytics, error: productAnalyticsError } = await supabase
      .from('product_analytics')
      .select('id')
      .limit(1);
      
    if (productAnalyticsError) {
      console.error('Error accessing product_analytics:', productAnalyticsError);
    } else {
      console.log('✓ product_analytics table accessible');
    }
    
    // Test marketplace_analytics table
    console.log('\n11. Testing marketplace_analytics table...');
    const { data: marketplaceAnalytics, error: marketplaceAnalyticsError } = await supabase
      .from('marketplace_analytics')
      .select('id')
      .limit(1);
      
    if (marketplaceAnalyticsError) {
      console.error('Error accessing marketplace_analytics:', marketplaceAnalyticsError);
    } else {
      console.log('✓ marketplace_analytics table accessible');
    }
    
    // Test user_follows table
    console.log('\n12. Testing user_follows table...');
    const { data: userFollows, error: userFollowsError } = await supabase
      .from('user_follows')
      .select('id')
      .limit(1);
      
    if (userFollowsError) {
      console.error('Error accessing user_follows:', userFollowsError);
    } else {
      console.log('✓ user_follows table accessible');
    }
    
    console.log('\n✅ All new tables are accessible!');
    
  } catch (error) {
    console.error('Error testing tables:', error);
  }
}

// Run the test
testNewTables();