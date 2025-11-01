-- Create missing gift tables
-- Date: 2025-11-01

-- Create virtual_gifts table
CREATE TABLE IF NOT EXISTS public.virtual_gifts (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USDT',
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

-- Create gift_transactions table
CREATE TABLE IF NOT EXISTS public.gift_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES public.users(id),
    to_user_id UUID NOT NULL REFERENCES public.users(id),
    gift_id VARCHAR(50) NOT NULL REFERENCES public.virtual_gifts(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    total_amount NUMERIC(10,2) NOT NULL,
    message TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    content_id UUID, -- Optional: gift related to specific content
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tip_transactions table
CREATE TABLE IF NOT EXISTS public.tip_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES public.users(id),
    to_user_id UUID NOT NULL REFERENCES public.users(id),
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USDT',
    message TEXT,
    content_id UUID, -- Optional: tip related to specific content
    is_anonymous BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_gift_inventory table
CREATE TABLE IF NOT EXISTS public.user_gift_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    gift_id VARCHAR(50) NOT NULL REFERENCES public.virtual_gifts(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, gift_id)
);

-- Create creator_tip_settings table
CREATE TABLE IF NOT EXISTS public.creator_tip_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id),
    is_enabled BOOLEAN DEFAULT true,
    min_tip_amount NUMERIC(10,2) DEFAULT 0.50,
    max_tip_amount NUMERIC(10,2) DEFAULT 100.00,
    suggested_amounts JSONB, -- Array of suggested tip amounts
    thank_you_message TEXT,
    allow_anonymous BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_virtual_gifts_category ON public.virtual_gifts(category);
CREATE INDEX IF NOT EXISTS idx_virtual_gifts_rarity ON public.virtual_gifts(rarity);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_from_user_id ON public.gift_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_to_user_id ON public.gift_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_gift_id ON public.gift_transactions(gift_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_created_at ON public.gift_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_status ON public.gift_transactions(status);
CREATE INDEX IF NOT EXISTS idx_tip_transactions_from_user_id ON public.tip_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_tip_transactions_to_user_id ON public.tip_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_tip_transactions_created_at ON public.tip_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_tip_transactions_status ON public.tip_transactions(status);
CREATE INDEX IF NOT EXISTS idx_user_gift_inventory_user_id ON public.user_gift_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gift_inventory_gift_id ON public.user_gift_inventory(gift_id);
CREATE INDEX IF NOT EXISTS idx_creator_tip_settings_user_id ON public.creator_tip_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_tip_settings_is_enabled ON public.creator_tip_settings(is_enabled);

-- Insert sample data
INSERT INTO public.virtual_gifts (id, name, emoji, price, currency, category, rarity, available) VALUES
    ('rose', 'Rose', '🌹', 5.00, 'USD', 'basic', 'common', true),
    ('chocolate', 'Chocolate', '🍫', 10.00, 'USD', 'basic', 'common', true),
    ('diamond', 'Diamond', '💎', 50.00, 'USD', 'premium', 'rare', true),
    ('crown', 'Crown', '👑', 100.00, 'USD', 'special', 'epic', true)
ON CONFLICT (id) DO NOTHING;