-- Create rewards tables directly - using existing column names from migration 0009

-- Insert sample data into existing reward_rules table (using actual column names)
INSERT INTO public.reward_rules (action_type, display_name, base_eloits, is_active) VALUES
    ('post_creation', 'Post Creation', 10.00, true),
    ('post_like', 'Like Post', 1.00, true),
    ('post_comment', 'Comment on Post', 2.00, true),
    ('referral_signup', 'Referral Signup', 50.00, true),
    ('daily_login', 'Daily Login', 5.00, true)
ON CONFLICT (action_type) DO NOTHING;

-- Insert sample data into existing virtual_gifts table
INSERT INTO public.virtual_gifts (id, name, emoji, price, currency, category, rarity, available) VALUES
    ('rose', 'Rose', '🌹', 5.00, 'USDT', 'basic', 'common', true),
    ('chocolate', 'Chocolate', '🍫', 10.00, 'USDT', 'basic', 'common', true),
    ('diamond', 'Diamond', '💎', 50.00, 'USDT', 'premium', 'rare', true),
    ('crown', 'Crown', '👑', 100.00, 'USDT', 'special', 'epic', true)
ON CONFLICT (id) DO NOTHING;