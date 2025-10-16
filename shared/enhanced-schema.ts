import { pgTable, uuid, text, timestamp, boolean, jsonb, numeric, integer, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, followers } from './schema';

// Re-export some commonly used tables from shared/schema
export { followers };

// Profiles table
export const profiles = pgTable('profiles', {
  user_id: uuid('user_id').primaryKey(),
  username: text('username').unique().notNull(),
  email: text('email').notNull(),
  full_name: text('full_name'),
  avatar_url: text('avatar_url'),
  banner_url: text('banner_url'),
  bio: text('bio'),
  location: text('location'),
  website: text('website'),
  phone: text('phone'),
  date_of_birth: text('date_of_birth'),
  gender: text('gender'),
  is_verified: boolean('is_verified').default(false),
  points: integer('points').default(0),
  level: text('level').default('bronze'),
  role: text('role').default('user'),
  reputation: integer('reputation').default(0),
  followers_count: integer('followers_count').default(0),
  following_count: integer('following_count').default(0),
  posts_count: integer('posts_count').default(0),
  profile_views: integer('profile_views').default(0),
  is_online: boolean('is_online').default(false),
  last_active: timestamp('last_active'),
  profile_visibility: text('profile_visibility').default('public'),
  show_email: boolean('show_email').default(false),
  show_phone: boolean('show_phone').default(false),
  allow_direct_messages: boolean('allow_direct_messages').default(true),
  allow_notifications: boolean('allow_notifications').default(true),
  preferred_currency: text('preferred_currency').default('USD'),
  timezone: text('timezone'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Marketplace profiles table
export const marketplace_profiles = pgTable('marketplace_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  store_name: text('store_name'),
  store_description: text('store_description'),
  store_logo: text('store_logo'),
  store_banner: text('store_banner'),
  business_type: text('business_type').default('individual'),
  business_registration: text('business_registration'),
  tax_id: text('tax_id'),
  return_policy: text('return_policy'),
  shipping_policy: text('shipping_policy'),
  store_rating: numeric('store_rating', { precision: 3, scale: 2 }).default('0'),
  total_sales: integer('total_sales').default(0),
  total_orders: integer('total_orders').default(0),
  response_rate: numeric('response_rate', { precision: 5, scale: 2 }).default('0'),
  response_time: text('response_time'),
  is_active: boolean('is_active').default(true),
  seller_level: text('seller_level').default('bronze'),
  verification_status: text('verification_status').default('pending'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Freelance profiles table
export const freelance_profiles = pgTable('freelance_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  professional_title: text('professional_title'),
  overview: text('overview'),
  hourly_rate: numeric('hourly_rate', { precision: 8, scale: 2 }),
  availability: text('availability').default('available'),
  experience_level: text('experience_level').default('intermediate'),
  portfolio_url: text('portfolio_url'),
  resume_url: text('resume_url'),
  languages: jsonb('languages'),
  education: jsonb('education'),
  certifications: jsonb('certifications'),
  work_history: jsonb('work_history'),
  services_offered: jsonb('services_offered'),
  preferred_project_size: text('preferred_project_size'),
  response_time: text('response_time'),
  success_rate: numeric('success_rate', { precision: 5, scale: 2 }).default('0'),
  total_earnings: numeric('total_earnings', { precision: 12, scale: 2 }).default('0'),
  completed_projects: integer('completed_projects').default(0),
  repeat_clients: integer('repeat_clients').default(0),
  profile_completion: integer('profile_completion').default(0),
  is_available: boolean('is_available').default(true),
  is_featured: boolean('is_featured').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Crypto profiles table
export const crypto_profiles = pgTable('crypto_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  wallet_address: text('wallet_address').unique(),
  wallet_provider: text('wallet_provider'),
  kyc_status: text('kyc_status').default('pending'),
  kyc_verified_at: timestamp('kyc_verified_at'),
  trading_volume: numeric('trading_volume', { precision: 15, scale: 2 }).default('0'),
  total_trades: integer('total_trades').default(0),
  average_rating: numeric('average_rating', { precision: 3, scale: 2 }).default('0'),
  is_verified_trader: boolean('is_verified_trader').default(false),
  preferred_currencies: text('preferred_currencies').array(),
  trading_pairs: jsonb('trading_pairs'),
  risk_tolerance: text('risk_tolerance').default('medium'),
  investment_strategy: text('investment_strategy'),
  notification_preferences: jsonb('notification_preferences'),
  security_settings: jsonb('security_settings'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  seller_id: uuid('seller_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  category: text('category').notNull(),
  subcategory: text('subcategory'),
  brand: text('brand'),
  condition: text('condition').default('new'),
  sku: text('sku'),
  stock_quantity: integer('stock_quantity').default(0),
  images: jsonb('images'),
  specifications: jsonb('specifications'),
  tags: text('tags').array(),
  weight: numeric('weight', { precision: 8, scale: 2 }),
  dimensions: jsonb('dimensions'),
  shipping_info: jsonb('shipping_info'),
  return_policy: text('return_policy'),
  warranty: text('warranty'),
  is_featured: boolean('is_featured').default(false),
  is_active: boolean('is_active').default(true),
  is_digital: boolean('is_digital').default(false),
  digital_file_url: text('digital_file_url'),
  views_count: integer('views_count').default(0),
  favorites_count: integer('favorites_count').default(0),
  sales_count: integer('sales_count').default(0),
  rating: numeric('rating', { precision: 3, scale: 2 }).default('0'),
  reviews_count: integer('reviews_count').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  buyer_id: uuid('buyer_id').notNull(),
  seller_id: uuid('seller_id').notNull(),
  order_number: text('order_number').unique().notNull(),
  status: text('status').default('pending'),
  payment_status: text('payment_status').default('pending'),
  total_amount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  shipping_address: jsonb('shipping_address'),
  billing_address: jsonb('billing_address'),
  shipping_method: text('shipping_method'),
  tracking_number: text('tracking_number'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  shipped_at: timestamp('shipped_at'),
  delivered_at: timestamp('delivered_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Order items table
export const order_items = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_id: uuid('order_id').notNull(),
  product_id: uuid('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  total_price: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  product_snapshot: jsonb('product_snapshot'),
  created_at: timestamp('created_at').defaultNow(),
});

// Product reviews table
export const product_reviews = pgTable('product_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: uuid('product_id').notNull(),
  user_id: uuid('user_id').notNull(),
  order_id: uuid('order_id'),
  rating: integer('rating').notNull(),
  title: text('title'),
  content: text('content'),
  images: jsonb('images'),
  verified_purchase: boolean('verified_purchase').default(false),
  helpful_count: integer('helpful_count').default(0),
  is_featured: boolean('is_featured').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Shopping cart table
export const shopping_cart = pgTable('shopping_cart', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  product_id: uuid('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Product categories table
export const product_categories = pgTable('product_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  parent_id: uuid('parent_id'),
  image_url: text('image_url'),
  is_active: boolean('is_active').default(true),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Wishlist table
export const wishlist = pgTable('wishlist', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  product_id: uuid('product_id').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

// Store profiles table
export const store_profiles = pgTable('store_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  store_name: text('store_name').notNull(),
  store_description: text('store_description'),
  store_logo: text('store_logo'),
  store_banner: text('store_banner'),
  business_type: text('business_type').default('individual'),
  business_registration: text('business_registration'),
  tax_id: text('tax_id'),
  return_policy: text('return_policy'),
  shipping_policy: text('shipping_policy'),
  store_rating: numeric('store_rating', { precision: 3, scale: 2 }).default('0'),
  total_sales: integer('total_sales').default(0),
  total_orders: integer('total_orders').default(0),
  response_rate: numeric('response_rate', { precision: 5, scale: 2 }).default('0'),
  response_time: text('response_time'),
  is_active: boolean('is_active').default(true),
  seller_level: text('seller_level').default('bronze'),
  verification_status: text('verification_status').default('pending'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Referral links table
export const referral_links = pgTable('referral_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  referrer_id: uuid('referrer_id').notNull(),
  referral_code: text('referral_code').notNull().unique(),
  referral_url: text('referral_url').notNull(),
  type: text('type').default('general'),
  campaign_id: uuid('campaign_id'),
  click_count: integer('click_count').default(0),
  signup_count: integer('signup_count').default(0),
  conversion_count: integer('conversion_count').default(0),
  referrer_reward: numeric('referrer_reward', { precision: 10, scale: 2 }).default('20'),
  referee_reward: numeric('referee_reward', { precision: 10, scale: 2 }).default('35'),
  revenue_share_percentage: numeric('revenue_share_percentage', { precision: 5, scale: 2 }).default('0'),
  automatic_sharing_enabled: boolean('automatic_sharing_enabled').default(true),
  is_active: boolean('is_active').default(true),
  max_uses: integer('max_uses'),
  current_uses: integer('current_uses').default(0),
  expires_at: timestamp('expires_at'),
  description: text('description'),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Referral events table
export const referral_events = pgTable('referral_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  referral_link_id: uuid('referral_link_id').notNull(),
  referrer_id: uuid('referrer_id').notNull(),
  referee_id: uuid('referee_id'),
  event_type: text('event_type').notNull(), // 'click', 'signup', 'conversion'
  metadata: jsonb('metadata'),
  reward_amount: numeric('reward_amount', { precision: 10, scale: 2 }),
  reward_currency: text('reward_currency').default('USD'),
  is_reward_claimed: boolean('is_reward_claimed').default(false),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  referrer_url: text('referrer_url'),
  created_at: timestamp('created_at').defaultNow(),
});

// Reward sharing transactions table
export const reward_sharing_transactions = pgTable('reward_sharing_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sharer_id: uuid('sharer_id').notNull(),
  recipient_id: uuid('recipient_id').notNull(),
  original_reward_amount: numeric('original_reward_amount', { precision: 10, scale: 2 }).notNull(),
  shared_amount: numeric('shared_amount', { precision: 10, scale: 2 }).notNull(),
  sharing_percentage: numeric('sharing_percentage', { precision: 5, scale: 2 }).default('0.5'),
  transaction_type: text('transaction_type').notNull(), // 'automatic_referral_share'
  source_activity: text('source_activity').notNull(), // 'creator_economy', 'ad_revenue', etc.
  activity_id: uuid('activity_id'),
  status: text('status').default('completed'),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').defaultNow(),
});

// Pioneer badges table
export const pioneer_badges = pgTable('pioneer_badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  badge_number: integer('badge_number').notNull(), // 1-500
  earned_at: timestamp('earned_at').defaultNow(),
  eligibility_score: numeric('eligibility_score', { precision: 8, scale: 2 }).notNull(),
  activity_metrics: jsonb('activity_metrics'),
  verification_data: jsonb('verification_data'),
  is_verified: boolean('is_verified').default(true),
  created_at: timestamp('created_at').defaultNow(),
});

// User activity tracking for pioneer badge calculation
export const user_activity_sessions = pgTable('user_activity_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  session_start: timestamp('session_start').defaultNow(),
  session_end: timestamp('session_end'),
  total_time_minutes: integer('total_time_minutes').default(0),
  activities_count: integer('activities_count').default(0),
  quality_interactions: integer('quality_interactions').default(0),
  device_info: jsonb('device_info'),
  engagement_score: numeric('engagement_score', { precision: 5, scale: 2 }).default('0'),
  created_at: timestamp('created_at').defaultNow(),
});

// Content analytics table used by dashboards and aggregations
export const content_analytics = pgTable('content_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  source_type: text('source_type').notNull(), // e.g., 'post'|'product'|'stream'
  source_id: uuid('source_id').notNull(),
  title: text('title').notNull(),
  type: text('type').notNull(),
  platform: text('platform').notNull(),
  publish_date: timestamp('publish_date').defaultNow(),
  views: integer('views').default(0),
  engagement: text('engagement'),
  revenue: numeric('revenue', { precision: 12, scale: 2 }).default('0'),
  analytics: jsonb('analytics'),
  thumbnail: text('thumbnail'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Freelance jobs table
export const freelance_jobs = pgTable('freelance_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  client_id: uuid('client_id').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  subcategory: text('subcategory'),
  budget_type: text('budget_type').notNull(),
  budget_min: numeric('budget_min', { precision: 10, scale: 2 }),
  budget_max: numeric('budget_max', { precision: 10, scale: 2 }),
  budget_amount: numeric('budget_amount', { precision: 10, scale: 2 }),
  deadline: timestamp('deadline'),
  duration: text('duration'),
  experience_level: text('experience_level').notNull(),
  skills: text('skills').array().notNull(),
  status: text('status').default('open'),
  visibility: text('visibility').default('public'),
  attachments: text('attachments').array(),
  applications_count: integer('applications_count').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(users, {
    fields: [products.seller_id],
    references: [users.id],
  }),
  reviews: many(product_reviews),
  orderItems: many(order_items),
  cartItems: many(shopping_cart),
  wishlistItems: many(wishlist),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, {
    fields: [orders.buyer_id],
    references: [users.id],
    relationName: 'buyerOrders',
  }),
  seller: one(users, {
    fields: [orders.seller_id],
    references: [users.id],
    relationName: 'sellerOrders',
  }),
  items: many(order_items),
  reviews: many(product_reviews),
}));

export const orderItemsRelations = relations(order_items, ({ one }) => ({
  order: one(orders, {
    fields: [order_items.order_id],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [order_items.product_id],
    references: [products.id],
  }),
}));

export const productReviewsRelations = relations(product_reviews, ({ one }) => ({
  product: one(products, {
    fields: [product_reviews.product_id],
    references: [products.id],
  }),
  user: one(users, {
    fields: [product_reviews.user_id],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [product_reviews.order_id],
    references: [orders.id],
  }),
}));

export const shoppingCartRelations = relations(shopping_cart, ({ one }) => ({
  user: one(users, {
    fields: [shopping_cart.user_id],
    references: [users.id],
  }),
  product: one(products, {
    fields: [shopping_cart.product_id],
    references: [products.id],
  }),
}));

export const productCategoriesRelations = relations(product_categories, ({ one, many }) => ({
  parent: one(product_categories, {
    fields: [product_categories.parent_id],
    references: [product_categories.id],
    relationName: 'categoryChildren',
  }),
  children: many(product_categories, { relationName: 'categoryChildren' }),
}));

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(users, {
    fields: [wishlist.user_id],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlist.product_id],
    references: [products.id],
  }),
}));

export const storeProfilesRelations = relations(store_profiles, ({ one }) => ({
  user: one(users, {
    fields: [store_profiles.user_id],
    references: [users.id],
  }),
}));

export const referralLinksRelations = relations(referral_links, ({ one, many }) => ({
  referrer: one(users, {
    fields: [referral_links.referrer_id],
    references: [users.id],
  }),
  events: many(referral_events),
}));

export const referralEventsRelations = relations(referral_events, ({ one }) => ({
  referralLink: one(referral_links, {
    fields: [referral_events.referral_link_id],
    references: [referral_links.id],
  }),
  referrer: one(users, {
    fields: [referral_events.referrer_id],
    references: [users.id],
    relationName: 'referrerEvents',
  }),
  referee: one(users, {
    fields: [referral_events.referee_id],
    references: [users.id],
    relationName: 'refereeEvents',
  }),
}));

export const rewardSharingTransactionsRelations = relations(reward_sharing_transactions, ({ one }) => ({
  sharer: one(users, {
    fields: [reward_sharing_transactions.sharer_id],
    references: [users.id],
    relationName: 'sharerTransactions',
  }),
  recipient: one(users, {
    fields: [reward_sharing_transactions.recipient_id],
    references: [users.id],
    relationName: 'recipientTransactions',
  }),
}));

export const pioneerBadgesRelations = relations(pioneer_badges, ({ one }) => ({
  user: one(users, {
    fields: [pioneer_badges.user_id],
    references: [users.id],
  }),
}));

export const userActivitySessionsRelations = relations(user_activity_sessions, ({ one }) => ({
  user: one(users, {
    fields: [user_activity_sessions.user_id],
    references: [users.id],
  }),
}));
