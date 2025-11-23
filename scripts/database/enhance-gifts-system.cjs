#!/usr/bin/env node

/**
 * Migration script to enhance the gifts system
 * - Adds virtual_gifts table with full gift data and descriptions
 * - Adds gift_categories table for better organization
 * - Adds indexes for performance optimization
 * - Sets up RLS policies for gift-related tables
 */

const fs = require("fs");
const path = require("path");

const migrationSQL = `
-- Create gift_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.gift_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(20),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create virtual_gifts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.virtual_gifts (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(50) NOT NULL,
  description TEXT,
  detailed_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  category VARCHAR(50) NOT NULL REFERENCES public.gift_categories(slug),
  rarity VARCHAR(20) NOT NULL DEFAULT 'common',
  animation VARCHAR(100),
  sound VARCHAR(100),
  effects TEXT[],
  available BOOLEAN DEFAULT true,
  seasonal_start DATE,
  seasonal_end DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default gift categories if not exists
INSERT INTO public.gift_categories (name, slug, description, color, display_order)
VALUES
  ('Basic Gifts', 'basic', 'Love and appreciation', 'bg-red-500', 0),
  ('Premium Gifts', 'premium', 'Exclusive and special', 'bg-purple-500', 1),
  ('Seasonal Gifts', 'seasonal', 'Holiday and events', 'bg-green-500', 2),
  ('Special Events', 'special', 'Celebrations', 'bg-yellow-500', 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert default virtual gifts if not exists
INSERT INTO public.virtual_gifts (
  id, name, emoji, description, detailed_description, price, currency, 
  category, rarity, effects, available
) VALUES
  -- Basic Gifts
  ('coffee', 'Coffee', '☕', 'Buy them a coffee!', 'A warm cup of coffee to brighten their day. Perfect for showing you care and keeping them energized.', 1.99, 'USD', 'basic', 'common', '{steam}', true),
  ('heart', 'Heart', '❤️', 'Show some love', 'A symbol of love and affection. Express your feelings with this timeless gesture of care and appreciation.', 0.99, 'USD', 'basic', 'common', '{pulse}', true),
  ('thumbs-up', 'Thumbs Up', '👍', 'Great job!', 'A classic gesture of approval and encouragement. Use this to celebrate achievements and good work.', 0.50, 'USD', 'basic', 'common', '{}', true),
  ('clap', 'Applause', '👏', 'Round of applause', 'Show appreciation and celebrate with a burst of applause. Perfect for congratulating great performances.', 1.50, 'USD', 'basic', 'common', '{clap-sound}', true),
  
  -- Premium Gifts
  ('rose', 'Rose', '🌹', 'A beautiful rose', 'A stunning rose symbolizing love, admiration, and respect. An elegant way to show someone special how much they mean to you.', 4.99, 'USD', 'premium', 'rare', '{sparkle,romantic-music}', true),
  ('cake', 'Birthday Cake', '🎂', 'Celebrate special moments', 'Celebrate birthdays, anniversaries, and special occasions with this festive virtual cake. Spread joy and happiness.', 7.99, 'USD', 'premium', 'rare', '{confetti,birthday-song}', true),
  ('trophy', 'Trophy', '🏆', 'You are a champion!', 'Award this to recognize excellence and achievements. Perfect for motivating and celebrating winners and top performers.', 9.99, 'USD', 'premium', 'epic', '{golden-glow,victory-sound}', true),
  ('diamond', 'Diamond', '💎', 'You shine bright!', 'A precious and rare gem that sparkles. Represent the exceptional value and brilliance of someone truly special.', 19.99, 'USD', 'premium', 'epic', '{diamond-sparkle,crystal-sound}', true),
  
  -- Special Events
  ('unicorn', 'Unicorn', '🦄', 'Magical and rare!', 'A mystical and magical creature that brings wonder and enchantment. Perfect for celebrating something truly unique and extraordinary.', 29.99, 'USD', 'special', 'legendary', '{rainbow,magic-sound,unicorn-animation}', true),
  ('crown', 'Crown', '👑', 'You rule!', 'The ultimate symbol of royalty and excellence. Crown someone as the best and show them they are supreme in your eyes.', 49.99, 'USD', 'special', 'legendary', '{royal-glow,trumpet-fanfare}', true),
  
  -- Seasonal Gifts
  ('pumpkin', 'Spooky Pumpkin', '🎃', 'Halloween special!', 'A spooky jack-o-lantern perfect for the Halloween season. Bring festive cheer and Halloween spirit to your friends.', 3.99, 'USD', 'seasonal', 'rare', '{spooky-glow,halloween-sound}', false),
  ('ghost', 'Friendly Ghost', '👻', 'Boo-tiful!', 'A friendly ghost ready to spook you with cuteness. Great for Halloween celebrations and autumn festivities.', 2.99, 'USD', 'seasonal', 'common', '{float,ghost-sound}', false),
  ('christmas-tree', 'Christmas Tree', '🎄', 'Merry Christmas!', 'A beautiful Christmas tree decorated with lights and ornaments. Spread holiday cheer and festive joy.', 5.99, 'USD', 'seasonal', 'rare', '{twinkling-lights,jingle-bells}', false),
  ('santa', 'Santa Claus', '🎅', 'Ho ho ho!', 'Santa Claus is here to bring holiday magic and festive cheer. Perfect for Christmas celebrations and holiday gifting.', 8.99, 'USD', 'seasonal', 'epic', '{snow,ho-ho-ho-sound}', false)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gift_transactions_from_user ON public.gift_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_to_user ON public.gift_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_created ON public.gift_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tip_transactions_from_user ON public.tip_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_tip_transactions_to_user ON public.tip_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_tip_transactions_created ON public.tip_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_gift_inventory_user ON public.user_gift_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gift_inventory_gift ON public.user_gift_inventory(gift_id);

-- Enable RLS on gift_categories
ALTER TABLE public.gift_categories ENABLE ROW LEVEL SECURITY;

-- Enable RLS on virtual_gifts
ALTER TABLE public.virtual_gifts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - allow everyone to view gifts (gifts are public)
CREATE POLICY "Enable read access for all users" ON public.gift_categories
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON public.virtual_gifts
  FOR SELECT USING (true);

-- Create a view for getting recent recipients with gift details
CREATE OR REPLACE VIEW public.recent_gift_recipients AS
SELECT DISTINCT ON (gt.to_user_id)
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.bio,
  gt.from_user_id,
  gt.created_at as last_gift_date,
  COUNT(*) OVER (PARTITION BY gt.to_user_id) as total_gifts_received
FROM public.gift_transactions gt
JOIN public.profiles p ON gt.to_user_id = p.id
WHERE gt.status = 'completed'
ORDER BY gt.to_user_id, gt.created_at DESC;

-- Grant appropriate permissions
GRANT SELECT ON public.gift_categories TO anon, authenticated;
GRANT SELECT ON public.virtual_gifts TO anon, authenticated;
GRANT SELECT ON public.recent_gift_recipients TO anon, authenticated;
`;

// Write the migration file
const migrationDir = path.join(__dirname, "../database/migrations");
if (!fs.existsSync(migrationDir)) {
  fs.mkdirSync(migrationDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 14);
const migrationFile = path.join(migrationDir, `${timestamp}_enhance_gifts_system.sql`);

fs.writeFileSync(migrationFile, migrationSQL);
console.log(`✅ Migration file created: ${migrationFile}`);
console.log(`
📋 To apply this migration to Supabase:

1. Copy the SQL from the migration file above
2. Go to your Supabase dashboard: https://app.supabase.com/
3. Navigate to SQL Editor
4. Create a new query and paste the SQL
5. Execute the query

OR use the Supabase CLI:
   supabase db push

The migration will:
✓ Create gift_categories table for organizing gifts
✓ Create virtual_gifts table with full gift data and descriptions
✓ Insert default gifts with detailed descriptions
✓ Create indexes for performance optimization
✓ Set up RLS policies for security
✓ Create a view for fetching recent gift recipients

After applying, all gift data will be fetched from the database instead of mock data.
`);
