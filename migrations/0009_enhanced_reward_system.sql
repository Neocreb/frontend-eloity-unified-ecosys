-- Migration for Enhanced Eloits Reward Token System

-- Create reward_rules table
CREATE TABLE IF NOT EXISTS public.reward_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    base_eloits NUMERIC(10,2) NOT NULL,
    base_wallet_bonus NUMERIC(20,8) DEFAULT '0',
    currency TEXT DEFAULT 'USDT',
    daily_limit INTEGER,
    weekly_limit INTEGER,
    monthly_limit INTEGER,
    minimum_trust_score NUMERIC(5,2) DEFAULT '0',
    minimum_value NUMERIC(15,2),
    decay_enabled BOOLEAN DEFAULT true,
    decay_start INTEGER DEFAULT 1,
    decay_rate NUMERIC(5,4) DEFAULT '0.1',
    min_multiplier NUMERIC(3,2) DEFAULT '0.1',
    requires_moderation BOOLEAN DEFAULT false,
    quality_threshold NUMERIC(3,2) DEFAULT '0',
    conditions JSONB,
    is_active BOOLEAN DEFAULT true,
    active_from TIMESTAMP WITH TIME ZONE,
    active_to TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    last_modified_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_rewards table
CREATE TABLE IF NOT EXISTS public.user_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id),
    current_balance NUMERIC(15,2) DEFAULT '0',
    total_earned NUMERIC(15,2) DEFAULT '0',
    total_spent NUMERIC(15,2) DEFAULT '0',
    trust_score NUMERIC(5,2) DEFAULT '50',
    trust_level TEXT DEFAULT 'bronze',
    reward_multiplier NUMERIC(3,2) DEFAULT '1.0',
    daily_cap INTEGER DEFAULT 1000,
    streak_days INTEGER DEFAULT 0,
    last_activity_date TIMESTAMP WITH TIME ZONE,
    tier TEXT DEFAULT 'bronze',
    referral_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reward_transactions table
CREATE TABLE IF NOT EXISTS public.reward_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    action_type TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    balance_after NUMERIC(15,2) NOT NULL,
    description TEXT,
    metadata JSONB,
    trust_score_impact NUMERIC(5,2) DEFAULT '0',
    multiplier_applied NUMERIC(3,2) DEFAULT '1.0',
    decay_factor NUMERIC(3,2) DEFAULT '1.0',
    status TEXT DEFAULT 'completed',
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trust_history table
CREATE TABLE IF NOT EXISTS public.trust_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    previous_score NUMERIC(5,2),
    new_score NUMERIC(5,2) NOT NULL,
    change_reason TEXT,
    activity_type TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create redemptions table
CREATE TABLE IF NOT EXISTS public.redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payout_method TEXT NOT NULL,
    payout_details JSONB,
    status TEXT DEFAULT 'pending',
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    batch_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.users(id),
    referee_id UUID REFERENCES public.users(id),
    referral_code TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending',
    depth INTEGER DEFAULT 1,
    reward_earned NUMERIC(10,2) DEFAULT '0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE
);

-- Create system_config table
CREATE TABLE IF NOT EXISTS public.system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    data_type TEXT DEFAULT 'string',
    category TEXT DEFAULT 'general',
    is_editable BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_action_counts table for tracking activity counts
CREATE TABLE IF NOT EXISTS public.daily_action_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    action TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(user_id, action, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reward_rules_action_type ON public.reward_rules(action_type);
CREATE INDEX IF NOT EXISTS idx_reward_rules_is_active ON public.reward_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON public.user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_trust_level ON public.user_rewards(trust_level);
CREATE INDEX IF NOT EXISTS idx_user_rewards_tier ON public.user_rewards(tier);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_user_id ON public.reward_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_action_type ON public.reward_transactions(action_type);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_created_at ON public.reward_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_status ON public.reward_transactions(status);
CREATE INDEX IF NOT EXISTS idx_trust_history_user_id ON public.trust_history(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_history_created_at ON public.trust_history(created_at);
CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON public.redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON public.redemptions(status);
CREATE INDEX IF NOT EXISTS idx_redemptions_created_at ON public.redemptions(created_at);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON public.referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_system_config_key ON public.system_config(key);
CREATE INDEX IF NOT EXISTS idx_system_config_category ON public.system_config(category);
CREATE INDEX IF NOT EXISTS idx_daily_action_counts_user_id ON public.daily_action_counts(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_action_counts_action ON public.daily_action_counts(action);
CREATE INDEX IF NOT EXISTS idx_daily_action_counts_date ON public.daily_action_counts(date);

-- Enable RLS (Row Level Security) on all tables
ALTER TABLE public.reward_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_action_counts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own reward data" ON public.user_rewards
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage user rewards" ON public.user_rewards
    FOR ALL USING (true);

CREATE POLICY "Users can view their own transactions" ON public.reward_transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert transactions" ON public.reward_transactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own trust history" ON public.trust_history
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert trust history" ON public.trust_history
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own redemptions" ON public.redemptions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert redemptions" ON public.redemptions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update redemptions" ON public.redemptions
    FOR UPDATE USING (true);

CREATE POLICY "Users can view their own referrals" ON public.referrals
    FOR SELECT USING (referrer_id = auth.uid() OR referee_id = auth.uid());

CREATE POLICY "Users can insert referrals as referrer" ON public.referrals
    FOR INSERT WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "System can update referrals" ON public.referrals
    FOR UPDATE USING (true);

CREATE POLICY "Admins can manage system config" ON public.system_config
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Everyone can view system config" ON public.system_config
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own daily action counts" ON public.daily_action_counts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage daily action counts" ON public.daily_action_counts
    FOR ALL USING (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.reward_rules TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_rewards TO authenticated;
GRANT SELECT, INSERT ON public.reward_transactions TO authenticated;
GRANT SELECT, INSERT ON public.trust_history TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.redemptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT SELECT ON public.system_config TO authenticated;
GRANT ALL ON public.system_config TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.daily_action_counts TO authenticated;

-- Insert default system configuration
INSERT INTO public.system_config (key, value, description, data_type, category, is_editable) VALUES
    ('conversion_rate', '1000', 'ELO to USD conversion rate (1000 ELO = $1.00)', 'number', 'rewards', true),
    ('payout_mode', 'manual', 'Payout mode (manual or automated)', 'string', 'rewards', true),
    ('minimum_redeemable_balance', '500', 'Minimum ELO balance required for redemption', 'number', 'rewards', true),
    ('max_monthly_redemption_per_tier', '10000', 'Maximum USD redemption per month per tier', 'number', 'rewards', true),
    ('bonus_multipliers', '{"trust_bronze":1.0,"trust_silver":1.2,"trust_gold":1.5,"trust_platinum":2.0,"trust_diamond":3.0,"badge_verified":1.1,"badge_pioneer":1.3}', 'Bonus multipliers for trust levels and badges', 'json', 'rewards', true)
ON CONFLICT (key) DO NOTHING;

-- Insert default reward rules
INSERT INTO public.reward_rules (
    action_type, display_name, description, base_eloits, base_wallet_bonus, currency,
    daily_limit, weekly_limit, monthly_limit, minimum_trust_score, decay_enabled,
    decay_start, decay_rate, min_multiplier, requires_moderation, quality_threshold, is_active
) VALUES
    ('post_content', 'Create Post', 'Earn points for creating quality content', 3.0, 0, 'USDT', 10, 50, 200, 0, true, 3, 0.15, 0.2, false, 0.5, true),
    ('like_post', 'Like Post', 'Earn points for engaging with content', 0.5, 0, 'USDT', 100, 500, 2000, 0, true, 50, 0.1, 0.1, false, 0, true),
    ('comment_post', 'Comment on Post', 'Earn points for meaningful comments', 1.5, 0, 'USDT', 50, 300, 1000, 0, true, 20, 0.12, 0.15, false, 0.3, true),
    ('share_content', 'Share Content', 'Earn points for sharing quality content', 2.0, 0, 'USDT', 20, 100, 300, 10, true, 10, 0.2, 0.2, false, 0.5, true),
    ('daily_login', 'Daily Login', 'Earn points for daily engagement', 5.0, 0, 'USDT', 1, 7, 31, 0, false, 1, 0, 1.0, false, 0, true),
    ('purchase_product', 'Purchase Product', 'Earn points and wallet bonus for marketplace purchases', 10.0, 0.01, 'USDT', NULL, NULL, NULL, 0, false, 1, 0, 1.0, false, 0, true),
    ('product_sold', 'Product Sold', 'Earn points for selling products in marketplace', 750.0, 0, 'USDT', NULL, NULL, NULL, 0, false, 1, 0, 1.0, false, 0, true),
    ('complete_profile', 'Complete Profile', 'One-time reward for completing profile', 25.0, 0, 'USDT', 1, 1, 1, 0, false, 1, 0, 1.0, false, 0, true),
    ('refer_user', 'Refer User', 'Earn points for successful referrals with smart anti-abuse protection', 1000.0, 0.5, 'USDT', NULL, NULL, NULL, 15, true, 3, 0.25, 0.1, true, 0, true),
    ('multi_level_referral', 'Multi-level Referral', 'Earn points for multi-level referrals', 100.0, 0, 'USDT', NULL, NULL, NULL, 20, true, 1, 0.1, 0.1, false, 0, true)
ON CONFLICT (action_type) DO NOTHING;