-- Create rewards table
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    action_type VARCHAR(50) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    description TEXT,
    metadata JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Create user_rewards table (summary data)
CREATE TABLE IF NOT EXISTS public.user_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id),
    total_earned NUMERIC(12,2) DEFAULT 0,
    today_earned NUMERIC(10,2) DEFAULT 0,
    streak INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    next_level_requirement NUMERIC(10,2) DEFAULT 100,
    available_balance NUMERIC(12,2) DEFAULT 0,
    pending_rewards NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_action_counts table
CREATE TABLE IF NOT EXISTS public.daily_action_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    action VARCHAR(50) NOT NULL,
    count INTEGER DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(user_id, action, date)
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
    currency VARCHAR(3) DEFAULT 'USD',
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
CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON public.rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_action_type ON public.rewards(action_type);
CREATE INDEX IF NOT EXISTS idx_rewards_created_at ON public.rewards(created_at);
CREATE INDEX IF NOT EXISTS idx_rewards_status ON public.rewards(status);

CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON public.user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_updated_at ON public.user_rewards(updated_at);

CREATE INDEX IF NOT EXISTS idx_daily_action_counts_user_id ON public.daily_action_counts(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_action_counts_action ON public.daily_action_counts(action);
CREATE INDEX IF NOT EXISTS idx_daily_action_counts_date ON public.daily_action_counts(date);

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

-- Enable RLS (Row Level Security) on all tables
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_action_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tip_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gift_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_tip_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own rewards" ON public.rewards
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert rewards" ON public.rewards
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage reward rules" ON public.reward_rules
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can view their own reward summary" ON public.user_rewards
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can update user rewards" ON public.user_rewards
    FOR UPDATE USING (true);

CREATE POLICY "Users can view their own daily action counts" ON public.daily_action_counts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can update daily action counts" ON public.daily_action_counts
    FOR ALL USING (true);

CREATE POLICY "Virtual gifts are viewable by everyone" ON public.virtual_gifts
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage virtual gifts" ON public.virtual_gifts
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can view their gift transactions" ON public.gift_transactions
    FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can insert gift transactions" ON public.gift_transactions
    FOR INSERT WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Users can view their tip transactions" ON public.tip_transactions
    FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can insert tip transactions" ON public.tip_transactions
    FOR INSERT WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Users can view their gift inventory" ON public.user_gift_inventory
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can update gift inventory" ON public.user_gift_inventory
    FOR ALL USING (true);

CREATE POLICY "Users can view their tip settings" ON public.creator_tip_settings
    FOR SELECT USING (user_id = auth.uid() OR is_enabled = true);

CREATE POLICY "Users can update their tip settings" ON public.creator_tip_settings
    FOR UPDATE USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT SELECT ON public.rewards TO authenticated;
GRANT INSERT ON public.rewards TO authenticated;
GRANT ALL ON public.reward_rules TO authenticated;
GRANT SELECT, UPDATE ON public.user_rewards TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.daily_action_counts TO authenticated;
GRANT SELECT ON public.virtual_gifts TO authenticated;
GRANT SELECT, INSERT ON public.gift_transactions TO authenticated;
GRANT SELECT, INSERT ON public.tip_transactions TO authenticated;
GRANT SELECT ON public.user_gift_inventory TO authenticated;
GRANT SELECT, UPDATE ON public.creator_tip_settings TO authenticated;