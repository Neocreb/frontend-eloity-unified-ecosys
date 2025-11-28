-- Create RELOADLY Commission Settings Table
CREATE TABLE IF NOT EXISTS public.reloadly_commission_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type VARCHAR(50) NOT NULL,
    operator_id INTEGER,
    commission_type VARCHAR(50) NOT NULL CHECK (commission_type IN ('percentage', 'fixed_amount', 'none')),
    commission_value DECIMAL(10, 4) NOT NULL DEFAULT 0,
    min_amount DECIMAL(15, 2),
    max_amount DECIMAL(15, 2),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT commission_settings_unique UNIQUE(service_type, operator_id)
);

CREATE INDEX IF NOT EXISTS idx_commission_settings_service_type ON public.reloadly_commission_settings(service_type);
CREATE INDEX IF NOT EXISTS idx_commission_settings_operator ON public.reloadly_commission_settings(operator_id);
CREATE INDEX IF NOT EXISTS idx_commission_settings_active ON public.reloadly_commission_settings(is_active);

-- Create RELOADLY Transactions Table
CREATE TABLE IF NOT EXISTS public.reloadly_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    service_type VARCHAR(50) NOT NULL,
    operator_id INTEGER NOT NULL,
    operator_name VARCHAR(255),
    recipient VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    reloadly_amount DECIMAL(15, 2) NOT NULL,
    commission_earned DECIMAL(15, 4) NOT NULL DEFAULT 0,
    commission_rate DECIMAL(10, 4),
    commission_type VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'refunded')),
    reloadly_transaction_id VARCHAR(255),
    reloadly_reference_id VARCHAR(255),
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reloadly_transactions_user ON public.reloadly_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reloadly_transactions_status ON public.reloadly_transactions(status);
CREATE INDEX IF NOT EXISTS idx_reloadly_transactions_service_type ON public.reloadly_transactions(service_type);
CREATE INDEX IF NOT EXISTS idx_reloadly_transactions_created_at ON public.reloadly_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_reloadly_transactions_operator ON public.reloadly_transactions(operator_id);

-- Create RELOADLY Operator Cache Table
CREATE TABLE IF NOT EXISTS public.reloadly_operator_cache (
    operator_id INTEGER PRIMARY KEY,
    operator_name VARCHAR(255) NOT NULL,
    country_code VARCHAR(5) NOT NULL,
    supports_bundles BOOLEAN DEFAULT false,
    supports_data BOOLEAN DEFAULT false,
    supports_pin BOOLEAN DEFAULT false,
    supports_airtime BOOLEAN DEFAULT false,
    default_commission_rate DECIMAL(10, 4),
    sender_currency_code VARCHAR(10),
    sender_currency_symbol VARCHAR(10),
    destination_currency_code VARCHAR(10),
    destination_currency_symbol VARCHAR(10),
    fx_rate DECIMAL(20, 8),
    logo_urls JSONB,
    is_active BOOLEAN DEFAULT true,
    last_synced TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_operator_cache_country ON public.reloadly_operator_cache(country_code);
CREATE INDEX IF NOT EXISTS idx_operator_cache_active ON public.reloadly_operator_cache(is_active);

-- Create RELOADLY Commission Transaction History
CREATE TABLE IF NOT EXISTS public.reloadly_commission_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commission_setting_id UUID NOT NULL REFERENCES public.reloadly_commission_settings(id),
    transaction_id UUID NOT NULL REFERENCES public.reloadly_transactions(id),
    amount_before DECIMAL(15, 2),
    amount_after DECIMAL(15, 2),
    commission_before DECIMAL(10, 4),
    commission_after DECIMAL(10, 4),
    change_reason VARCHAR(255),
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commission_history_setting ON public.reloadly_commission_history(commission_setting_id);
CREATE INDEX IF NOT EXISTS idx_commission_history_transaction ON public.reloadly_commission_history(transaction_id);
CREATE INDEX IF NOT EXISTS idx_commission_history_created_at ON public.reloadly_commission_history(created_at);

-- RLS Policies
ALTER TABLE public.reloadly_commission_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reloadly_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reloadly_operator_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reloadly_commission_history ENABLE ROW LEVEL SECURITY;

-- Commission Settings: Admins can manage, users can only view
CREATE POLICY reloadly_commission_settings_admin_manage
    ON public.reloadly_commission_settings FOR ALL
    USING (auth.jwt_has_role('admin'))
    WITH CHECK (auth.jwt_has_role('admin'));

CREATE POLICY reloadly_commission_settings_user_view
    ON public.reloadly_commission_settings FOR SELECT
    USING (NOT auth.jwt_has_role('admin'));

-- Transactions: Users can see their own, admins can see all
CREATE POLICY reloadly_transactions_user_own
    ON public.reloadly_transactions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY reloadly_transactions_admin_all
    ON public.reloadly_transactions FOR ALL
    USING (auth.jwt_has_role('admin'))
    WITH CHECK (auth.jwt_has_role('admin'));

-- Operator Cache: Everyone can view, admins can manage
CREATE POLICY reloadly_operator_cache_select
    ON public.reloadly_operator_cache FOR SELECT
    USING (true);

CREATE POLICY reloadly_operator_cache_admin_manage
    ON public.reloadly_operator_cache FOR INSERT, UPDATE, DELETE
    USING (auth.jwt_has_role('admin'))
    WITH CHECK (auth.jwt_has_role('admin'));

-- Commission History: Admins only
CREATE POLICY reloadly_commission_history_admin
    ON public.reloadly_commission_history FOR ALL
    USING (auth.jwt_has_role('admin'))
    WITH CHECK (auth.jwt_has_role('admin'));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.reloadly_commission_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.reloadly_transactions TO authenticated;
GRANT SELECT ON public.reloadly_operator_cache TO authenticated;
GRANT SELECT ON public.reloadly_commission_history TO authenticated;

GRANT ALL ON public.reloadly_commission_settings TO service_role;
GRANT ALL ON public.reloadly_transactions TO service_role;
GRANT ALL ON public.reloadly_operator_cache TO service_role;
GRANT ALL ON public.reloadly_commission_history TO service_role;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
