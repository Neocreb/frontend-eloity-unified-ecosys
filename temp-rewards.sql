-- Create rewards tables directly

-- Create reward_rules table
CREATE TABLE IF NOT EXISTS public.reward_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(50) UNIQUE NOT NULL,
    base_reward NUMERIC(10,2) NOT NULL,
    multiplier NUMERIC(5,2),
    conditions JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create virtual_gifts table
CREATE TABLE IF NOT EXISTS public.virtual_gifts (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    category VARCHAR(20) NOT NULL CHECK (category IN ('basic', 'premium', 'special', 'seasonal')),
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    animation TEXT,
    sound TEXT,
    effects JSONB,
    available BOOLEAN DEFAULT true,
    seasonal_start TIMESTAMP WITH TIME ZONE,
    seasonal_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO public.reward_rules (action, base_reward, multiplier, is_active) VALUES
    ('post_creation', 10.00, 1.0, true),
    ('post_like', 1.00, 1.0, true),
    ('post_comment', 2.00, 1.0, true),
    ('referral_signup', 50.00, 1.0, true),
    ('daily_login', 5.00, 1.0, true)
ON CONFLICT (action) DO NOTHING;

INSERT INTO public.virtual_gifts (id, name, emoji, price, currency, category, rarity, available) VALUES
    ('rose', 'Rose', '🌹', 5.00, 'USD', 'basic', 'common', true),
    ('chocolate', 'Chocolate', '🍫', 10.00, 'USD', 'basic', 'common', true),
    ('diamond', 'Diamond', '💎', 50.00, 'USD', 'premium', 'rare', true),
    ('crown', 'Crown', '👑', 100.00, 'USD', 'special', 'epic', true)
ON CONFLICT (id) DO NOTHING;