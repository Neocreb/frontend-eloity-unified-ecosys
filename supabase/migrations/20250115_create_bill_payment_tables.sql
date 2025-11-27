-- Create bill payment transactions table
CREATE TABLE IF NOT EXISTS public.bill_payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('airtime', 'data', 'utility', 'gift_card')),
    provider_name VARCHAR(255) NOT NULL,
    operator_id INTEGER,
    recipient_phone VARCHAR(20),
    recipient_email VARCHAR(255),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    fee DECIMAL(15, 2) DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL,
    reloadly_transaction_id VARCHAR(255) UNIQUE,
    reloadly_status VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_reloadly_id (reloadly_transaction_id)
);

-- Create bill payment operators table (cache from RELOADLY)
CREATE TABLE IF NOT EXISTS public.bill_payment_operators (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('airtime', 'data', 'utility')),
    country_code VARCHAR(10) NOT NULL,
    country_name VARCHAR(255),
    supports_data BOOLEAN DEFAULT false,
    supports_airtime BOOLEAN DEFAULT true,
    supports_bundles BOOLEAN DEFAULT false,
    commission_rate DECIMAL(5, 2),
    fx_rate DECIMAL(15, 8),
    logo_url VARCHAR(512),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_country_code (country_code),
    INDEX idx_service_type (service_type),
    INDEX idx_is_active (is_active)
);

-- Create bill payment settings table
CREATE TABLE IF NOT EXISTS public.bill_payment_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value JSONB,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_setting_key (setting_key),
    INDEX idx_is_active (is_active)
);

-- Create bill payment audit log table
CREATE TABLE IF NOT EXISTS public.bill_payment_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    changes JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_admin_id (admin_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Enable Row Level Security
ALTER TABLE public.bill_payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_payment_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_payment_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bill_payment_transactions
CREATE POLICY "Users can view their own transactions"
    ON public.bill_payment_transactions
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own transactions"
    ON public.bill_payment_transactions
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- RLS Policies for bill_payment_operators (public read)
CREATE POLICY "Anyone can view active operators"
    ON public.bill_payment_operators
    FOR SELECT
    USING (is_active = true);

-- RLS Policies for bill_payment_settings (admin only)
CREATE POLICY "Only admins can view settings"
    ON public.bill_payment_settings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can update settings"
    ON public.bill_payment_settings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for bill_payment_audit_log (admin only)
CREATE POLICY "Only admins can view audit logs"
    ON public.bill_payment_audit_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Grant permissions
GRANT SELECT, INSERT ON public.bill_payment_transactions TO authenticated;
GRANT SELECT ON public.bill_payment_operators TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.bill_payment_settings TO authenticated;
GRANT SELECT, INSERT ON public.bill_payment_audit_log TO authenticated;
