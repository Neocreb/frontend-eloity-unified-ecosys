import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function createMissingTables() {
  console.log('Creating missing tables in PostgreSQL...');
  
  // Connect to PostgreSQL using the DATABASE_URL from .env
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // 1. Create marketplace tables
    console.log('\n--- Creating Marketplace Tables ---');
    
    // Create categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        image TEXT,
        product_count INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT false,
        parent_id UUID REFERENCES categories(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✓ categories table created');
    
    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(12,2) NOT NULL,
        discount_price DECIMAL(12,2),
        currency VARCHAR(3) DEFAULT 'USD',
        category_id UUID,
        subcategory_id UUID,
        image_url TEXT,
        in_stock BOOLEAN DEFAULT true,
        stock_quantity INTEGER DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        is_sponsored BOOLEAN DEFAULT false,
        boost_until TIMESTAMP WITH TIME ZONE,
        tags TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✓ products table created');
    
    // Create reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID,
        user_id UUID,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        comment TEXT,
        helpful_count INTEGER DEFAULT 0,
        verified_purchase BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✓ reviews table created');
    
    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        seller_id UUID,
        total_amount DECIMAL(12,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        shipping_address JSONB,
        billing_address JSONB,
        tracking_number VARCHAR(255),
        estimated_delivery DATE,
        delivered_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✓ orders table created');
    
    // Create order_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID,
        product_id UUID,
        quantity INTEGER NOT NULL,
        price DECIMAL(12,2) NOT NULL,
        total DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✓ order_items table created');
    
    // 2. Create feed tables
    console.log('\n--- Creating Feed Tables ---');
    
    // Create posts table (extending existing posts table)
    await client.query(`
      CREATE TABLE IF NOT EXISTS feed_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        content TEXT,
        media_urls TEXT[],
        media_types VARCHAR(10)[],
        feeling JSONB,
        location JSONB,
        privacy VARCHAR(20) DEFAULT 'public',
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        shares_count INTEGER DEFAULT 0,
        is_boosted BOOLEAN DEFAULT false,
        boost_expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✓ feed_posts table created');
    
    // Create post_likes table (extending existing post_likes table)
    await client.query(`
      CREATE TABLE IF NOT EXISTS feed_post_likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID,
        user_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      );
    `);
    
    console.log('✓ feed_post_likes table created');
    
    // Create post_comments table (extending existing post_comments table)
    await client.query(`
      CREATE TABLE IF NOT EXISTS feed_post_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID,
        user_id UUID,
        parent_id UUID,
        content TEXT NOT NULL,
        likes_count INTEGER DEFAULT 0,
        is_edited BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✓ feed_post_comments table created');
    
    // 3. Create analytics tables
    console.log('\n--- Creating Analytics Tables ---');
    
    // Create user_analytics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        date DATE NOT NULL,
        posts_count INTEGER DEFAULT 0,
        likes_received INTEGER DEFAULT 0,
        comments_received INTEGER DEFAULT 0,
        shares_received INTEGER DEFAULT 0,
        followers_count INTEGER DEFAULT 0,
        following_count INTEGER DEFAULT 0,
        engagement_rate DECIMAL(5,2) DEFAULT 0,
        active_minutes INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, date)
      );
    `);
    
    console.log('✓ user_analytics table created');
    
    // Create product_analytics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID,
        date DATE NOT NULL,
        views INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        purchases INTEGER DEFAULT 0,
        revenue DECIMAL(12,2) DEFAULT 0,
        conversion_rate DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(product_id, date)
      );
    `);
    
    console.log('✓ product_analytics table created');
    
    // Create marketplace_analytics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS marketplace_analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID,
        date DATE NOT NULL,
        total_sales DECIMAL(12,2) DEFAULT 0,
        total_orders INTEGER DEFAULT 0,
        avg_order_value DECIMAL(12,2) DEFAULT 0,
        conversion_rate DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(seller_id, date)
      );
    `);
    
    console.log('✓ marketplace_analytics table created');
    
    // 4. Create additional tables for other services
    console.log('\n--- Creating Additional Tables ---');
    
    // Create user_follows table (extending existing followers table)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_follows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        follower_id UUID,
        following_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(follower_id, following_id)
      );
    `);
    
    console.log('✓ user_follows table created');
    
    // Now create all indexes one by one to identify issues
    console.log('\n--- Creating Indexes ---');
    
    try {
      // Categories indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(featured);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);`);
      console.log('✓ categories indexes created');
    } catch (error) {
      console.log('⚠️  Categories indexes error:', error.message);
    }
    
    try {
      // Products indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);`);
      console.log('✓ products indexes created');
    } catch (error) {
      console.log('⚠️  Products indexes error:', error.message);
    }
    
    try {
      // Reviews indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);`);
      console.log('✓ reviews indexes created');
    } catch (error) {
      console.log('⚠️  Reviews indexes error:', error.message);
    }
    
    try {
      // Orders indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`);
      console.log('✓ orders indexes created');
    } catch (error) {
      console.log('⚠️  Orders indexes error:', error.message);
    }
    
    try {
      // Order items indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);`);
      console.log('✓ order_items indexes created');
    } catch (error) {
      console.log('⚠️  Order items indexes error:', error.message);
    }
    
    try {
      // Feed posts indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_feed_posts_user ON feed_posts(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_feed_posts_created ON feed_posts(created_at);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_feed_posts_boosted ON feed_posts(is_boosted);`);
      console.log('✓ feed_posts indexes created');
    } catch (error) {
      console.log('⚠️  Feed posts indexes error:', error.message);
    }
    
    try {
      // Feed post likes indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_feed_post_likes_post ON feed_post_likes(post_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_feed_post_likes_user ON feed_post_likes(user_id);`);
      console.log('✓ feed_post_likes indexes created');
    } catch (error) {
      console.log('⚠️  Feed post likes indexes error:', error.message);
    }
    
    try {
      // Feed post comments indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_feed_post_comments_post ON feed_post_comments(post_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_feed_post_comments_user ON feed_post_comments(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_feed_post_comments_parent ON feed_post_comments(parent_id);`);
      console.log('✓ feed_post_comments indexes created');
    } catch (error) {
      console.log('⚠️  Feed post comments indexes error:', error.message);
    }
    
    try {
      // Analytics indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_analytics_user ON user_analytics(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_analytics_date ON user_analytics(date);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_product_analytics_product ON product_analytics(product_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_product_analytics_date ON product_analytics(date);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_marketplace_analytics_seller ON marketplace_analytics(seller_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_marketplace_analytics_date ON marketplace_analytics(date);`);
      console.log('✓ analytics indexes created');
    } catch (error) {
      console.log('⚠️  Analytics indexes error:', error.message);
    }
    
    try {
      // User follows indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);`);
      console.log('✓ user_follows indexes created');
    } catch (error) {
      console.log('⚠️  User follows indexes error:', error.message);
    }
    
    console.log('\n✅ All missing tables created successfully!');
    
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await client.end();
  }
}

// Run the function
createMissingTables();