import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function createAdditionalTables() {
  console.log('Creating additional tables in PostgreSQL...');
  
  // Connect to PostgreSQL using the DATABASE_URL from .env
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // 1. Create crypto tables
    console.log('\n--- Creating Crypto Tables ---');
    
    // Create crypto wallets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS crypto_wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        wallet_address TEXT NOT NULL,
        wallet_provider TEXT NOT NULL,
        chain_type TEXT NOT NULL,
        balance DECIMAL(20,8) DEFAULT 0,
        currency TEXT DEFAULT 'USD',
        is_primary BOOLEAN DEFAULT false,
        is_connected BOOLEAN DEFAULT true,
        last_synced_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✓ crypto_wallets table created');
    
    // Create crypto transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS crypto_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        wallet_id UUID NOT NULL,
        transaction_hash TEXT UNIQUE,
        from_address TEXT NOT NULL,
        to_address TEXT NOT NULL,
        amount DECIMAL(20,8) NOT NULL,
        currency TEXT NOT NULL,
        transaction_fee DECIMAL(15,8),
        status TEXT DEFAULT 'pending',
        transaction_type TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        confirmations INTEGER DEFAULT 0,
        block_number INTEGER,
        gas_price DECIMAL(15,8),
        gas_limit DECIMAL(15,8),
        gas_used DECIMAL(15,8),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✓ crypto_transactions table created');
    
    // Create crypto trades table
    await client.query(`
      CREATE TABLE IF NOT EXISTS crypto_trades (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        transaction_id UUID,
        pair TEXT NOT NULL,
        side TEXT NOT NULL,
        price DECIMAL(15,8) NOT NULL,
        amount DECIMAL(20,8) NOT NULL,
        total_value DECIMAL(15,2) NOT NULL,
        fee DECIMAL(15,8),
        fee_currency TEXT,
        status TEXT DEFAULT 'completed',
        order_type TEXT DEFAULT 'market',
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✓ crypto_trades table created');
    
    // Create crypto prices table
    await client.query(`
      CREATE TABLE IF NOT EXISTS crypto_prices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        symbol TEXT NOT NULL,
        name TEXT NOT NULL,
        price_usd DECIMAL(15,8) NOT NULL,
        price_change_24h DECIMAL(8,2),
        volume_24h DECIMAL(20,2),
        market_cap DECIMAL(25,2),
        market_cap_rank INTEGER,
        high_24h DECIMAL(15,8),
        low_24h DECIMAL(15,8),
        circulating_supply DECIMAL(25,8),
        total_supply DECIMAL(25,8),
        max_supply DECIMAL(25,8),
        last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✓ crypto_prices table created');
    
    // Create p2p offers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS p2p_offers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        type TEXT NOT NULL,
        asset TEXT NOT NULL,
        fiat_currency TEXT NOT NULL,
        price DECIMAL(15,8) NOT NULL,
        min_amount DECIMAL(15,2),
        max_amount DECIMAL(15,2),
        total_amount DECIMAL(15,2),
        available_amount DECIMAL(15,2),
        payment_methods JSONB,
        terms TEXT,
        status TEXT DEFAULT 'active',
        completion_rate DECIMAL(5,2),
        avg_release_time INTEGER,
        total_trades INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✓ p2p_offers table created');
    
    // 2. Create additional feed tables
    console.log('\n--- Creating Additional Feed Tables ---');
    
    // Create user_stories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_stories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        media_url TEXT NOT NULL,
        media_type TEXT NOT NULL,
        caption TEXT,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        views_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✓ user_stories table created');
    
    // Create story_views table
    await client.query(`
      CREATE TABLE IF NOT EXISTS story_views (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        story_id UUID NOT NULL,
        viewer_id UUID NOT NULL,
        viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(story_id, viewer_id)
      );
    `);
    
    console.log('✓ story_views table created');
    
    // Create user_saved_posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_saved_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        post_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, post_id)
      );
    `);
    
    console.log('✓ user_saved_posts table created');
    
    // Create user_post_shares table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_post_shares (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        post_id UUID NOT NULL,
        shared_to TEXT, -- 'public', 'friends', 'group_id', etc.
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, post_id)
      );
    `);
    
    console.log('✓ user_post_shares table created');
    
    // Create post_reactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_reactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL,
        user_id UUID NOT NULL,
        reaction_type TEXT NOT NULL, -- 'like', 'love', 'haha', 'wow', 'sad', 'angry'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      );
    `);
    
    console.log('✓ post_reactions table created');
    
    // Create comment_likes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        comment_id UUID NOT NULL,
        user_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(comment_id, user_id)
      );
    `);
    
    console.log('✓ comment_likes table created');
    
    // Create comment_replies table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comment_replies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        comment_id UUID NOT NULL,
        user_id UUID NOT NULL,
        content TEXT NOT NULL,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✓ comment_replies table created');
    
    // 3. Create notification tables
    console.log('\n--- Creating Notification Tables ---');
    
    // Create notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        related_id UUID, -- ID of the related resource (post, comment, etc.)
        related_type TEXT, -- Type of the related resource
        is_read BOOLEAN DEFAULT false,
        is_archived BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        read_at TIMESTAMP WITH TIME ZONE
      );
    `);
    
    console.log('✓ notifications table created');
    
    // Create user_notification_preferences table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_notification_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        email_notifications BOOLEAN DEFAULT true,
        push_notifications BOOLEAN DEFAULT true,
        in_app_notifications BOOLEAN DEFAULT true,
        like_notifications BOOLEAN DEFAULT true,
        comment_notifications BOOLEAN DEFAULT true,
        follow_notifications BOOLEAN DEFAULT true,
        message_notifications BOOLEAN DEFAULT true,
        mention_notifications BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✓ user_notification_preferences table created');
    
    // Now create all indexes
    console.log('\n--- Creating Indexes ---');
    
    try {
      // Crypto indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_crypto_wallets_user ON crypto_wallets(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_crypto_wallets_address ON crypto_wallets(wallet_address);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_crypto_transactions_user ON crypto_transactions(user_id);`);
      // Skipping wallet_id index as it may not exist in all cases
      await client.query(`CREATE INDEX IF NOT EXISTS idx_crypto_transactions_hash ON crypto_transactions(transaction_hash);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_crypto_trades_user ON crypto_trades(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_crypto_trades_pair ON crypto_trades(pair);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_crypto_prices_symbol ON crypto_prices(symbol);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_crypto_prices_updated ON crypto_prices(last_updated);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_p2p_offers_user ON p2p_offers(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_p2p_offers_asset ON p2p_offers(asset);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_p2p_offers_status ON p2p_offers(status);`);
      console.log('✓ Crypto indexes created');
    } catch (error) {
      console.log('⚠️  Crypto indexes error:', error.message);
    }
    
    try {
      // Feed indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_stories_user ON user_stories(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_stories_expires ON user_stories(expires_at);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_story_views_story ON story_views(story_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_story_views_viewer ON story_views(viewer_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_saved_posts_user ON user_saved_posts(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_saved_posts_post ON user_saved_posts(post_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_post_shares_user ON user_post_shares(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_post_shares_post ON user_post_shares(post_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions(post_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_post_reactions_user ON post_reactions(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON comment_likes(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_comment_replies_comment ON comment_replies(comment_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_comment_replies_user ON comment_replies(user_id);`);
      console.log('✓ Feed indexes created');
    } catch (error) {
      console.log('⚠️  Feed indexes error:', error.message);
    }
    
    try {
      // Notification indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user ON user_notification_preferences(user_id);`);
      console.log('✓ Notification indexes created');
    } catch (error) {
      console.log('⚠️  Notification indexes error:', error.message);
    }
    
    console.log('\n✅ All additional tables created successfully!');
    
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await client.end();
  }
}

// Run the function
createAdditionalTables();