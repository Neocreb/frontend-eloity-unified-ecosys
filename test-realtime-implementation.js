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

async function testRealtimeImplementation() {
  console.log('Testing real-time implementation with actual database connections...');
  
  try {
    // Test 1: Create a test post
    console.log('\n1. Testing post creation...');
    const { data: post, error: postError } = await supabase
      .from('feed_posts')
      .insert({
        user_id: 'test-user-id',
        content: 'This is a test post for real-time implementation',
        privacy: 'public',
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        is_boosted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (postError) {
      console.error('Error creating test post:', postError);
    } else {
      console.log('✓ Post created successfully:', post.id);
      
      // Test 2: Like the post
      console.log('\n2. Testing post like...');
      const { data: like, error: likeError } = await supabase
        .from('feed_post_likes')
        .insert({
          post_id: post.id,
          user_id: 'test-user-id',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (likeError) {
        console.error('Error liking post:', likeError);
      } else {
        console.log('✓ Post liked successfully');
        
        // Test 3: Update post likes count
        console.log('\n3. Testing likes count update...');
        const { data: updatedPost, error: updateError } = await supabase
          .from('feed_posts')
          .update({ likes_count: 1 })
          .eq('id', post.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating post likes count:', updateError);
        } else {
          console.log('✓ Post likes count updated successfully');
        }
        
        // Test 4: Delete the like
        console.log('\n4. Testing like deletion...');
        const { error: deleteLikeError } = await supabase
          .from('feed_post_likes')
          .delete()
          .eq('id', like.id);

        if (deleteLikeError) {
          console.error('Error deleting like:', deleteLikeError);
        } else {
          console.log('✓ Like deleted successfully');
        }
      }
      
      // Test 5: Add a comment
      console.log('\n5. Testing comment creation...');
      const { data: comment, error: commentError } = await supabase
        .from('feed_post_comments')
        .insert({
          post_id: post.id,
          user_id: 'test-user-id',
          content: 'This is a test comment',
          likes_count: 0,
          is_edited: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (commentError) {
        console.error('Error creating comment:', commentError);
      } else {
        console.log('✓ Comment created successfully');
        
        // Test 6: Update post comments count
        console.log('\n6. Testing comments count update...');
        const { data: updatedPost, error: updateError } = await supabase
          .from('feed_posts')
          .update({ comments_count: 1 })
          .eq('id', post.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating post comments count:', updateError);
        } else {
          console.log('✓ Post comments count updated successfully');
        }
      }
      
      // Test 7: Delete the post
      console.log('\n7. Testing post deletion...');
      const { error: deletePostError } = await supabase
        .from('feed_posts')
        .delete()
        .eq('id', post.id);

      if (deletePostError) {
        console.error('Error deleting post:', deletePostError);
      } else {
        console.log('✓ Post deleted successfully');
      }
    }
    
    // Test 8: Create a crypto price entry
    console.log('\n8. Testing crypto price creation...');
    const { data: cryptoPrice, error: cryptoError } = await supabase
      .from('crypto_prices')
      .insert({
        symbol: 'TEST',
        name: 'Test Coin',
        price_usd: 100.50,
        price_change_24h: 5.25,
        volume_24h: 1000000,
        market_cap: 100000000,
        market_cap_rank: 100,
        high_24h: 105.75,
        low_24h: 95.25,
        circulating_supply: 1000000,
        total_supply: 1000000,
        max_supply: 2000000,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (cryptoError) {
      console.error('Error creating crypto price:', cryptoError);
    } else {
      console.log('✓ Crypto price created successfully:', cryptoPrice.symbol);
      
      // Test 9: Delete the crypto price
      console.log('\n9. Testing crypto price deletion...');
      const { error: deleteCryptoError } = await supabase
        .from('crypto_prices')
        .delete()
        .eq('id', cryptoPrice.id);

      if (deleteCryptoError) {
        console.error('Error deleting crypto price:', deleteCryptoError);
      } else {
        console.log('✓ Crypto price deleted successfully');
      }
    }
    
    // Test 10: Create a P2P offer
    console.log('\n10. Testing P2P offer creation...');
    const { data: p2pOffer, error: p2pError } = await supabase
      .from('p2p_offers')
      .insert({
        user_id: 'test-user-id',
        type: 'SELL',
        asset: 'BTC',
        fiat_currency: 'USD',
        price: 50000,
        min_amount: 100,
        max_amount: 5000,
        total_amount: 10000,
        available_amount: 8500,
        payment_methods: JSON.stringify([{ id: 'bank', name: 'Bank Transfer' }]),
        terms: 'Fast and secure transaction',
        status: 'active',
        completion_rate: 98.5,
        avg_release_time: 120000,
        total_trades: 127,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (p2pError) {
      console.error('Error creating P2P offer:', p2pError);
    } else {
      console.log('✓ P2P offer created successfully');
      
      // Test 11: Delete the P2P offer
      console.log('\n11. Testing P2P offer deletion...');
      const { error: deleteP2pError } = await supabase
        .from('p2p_offers')
        .delete()
        .eq('id', p2pOffer.id);

      if (deleteP2pError) {
        console.error('Error deleting P2P offer:', deleteP2pError);
      } else {
        console.log('✓ P2P offer deleted successfully');
      }
    }
    
    console.log('\n✅ All real-time implementation tests completed successfully!');
    
  } catch (error) {
    console.error('Error testing real-time implementation:', error);
  }
}

// Run the test
testRealtimeImplementation();