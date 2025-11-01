-- Insert sample gift data
-- Date: 2025-11-01

-- Insert sample virtual gifts
INSERT INTO public.virtual_gifts (id, name, emoji, price, currency, category, rarity, available) VALUES
    ('rose', 'Rose', '🌹', 5.00, 'USD', 'basic', 'common', true),
    ('chocolate', 'Chocolate', '🍫', 10.00, 'USD', 'basic', 'common', true),
    ('diamond', 'Diamond', '💎', 50.00, 'USD', 'premium', 'rare', true),
    ('crown', 'Crown', '👑', 100.00, 'USD', 'special', 'epic', true)
ON CONFLICT (id) DO NOTHING;

-- Note: For gift transactions, tip transactions, and user gift inventory, 
-- we would need actual user IDs to insert meaningful data
-- These would typically be inserted by the application when users interact with the system