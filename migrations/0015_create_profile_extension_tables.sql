-- Create marketplace_profiles table
CREATE TABLE IF NOT EXISTS public.marketplace_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    store_name TEXT,
    store_description TEXT,
    store_logo TEXT,
    store_banner TEXT,
    business_type TEXT DEFAULT 'individual',
    business_registration TEXT,
    tax_id TEXT,
    return_policy TEXT,
    shipping_policy TEXT,
    store_rating NUMERIC(3, 2) DEFAULT '0',
    total_sales INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    response_rate NUMERIC(5, 2) DEFAULT '0',
    response_time TEXT,
    is_active BOOLEAN DEFAULT true,
    seller_level TEXT DEFAULT 'bronze',
    verification_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create freelance_profiles table
CREATE TABLE IF NOT EXISTS public.freelance_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    professional_title TEXT,
    overview TEXT,
    hourly_rate NUMERIC(8, 2),
    availability TEXT DEFAULT 'available',
    experience_level TEXT DEFAULT 'intermediate',
    portfolio_url TEXT,
    resume_url TEXT,
    languages JSONB,
    education JSONB,
    certifications JSONB,
    work_history JSONB,
    services_offered JSONB,
    preferred_project_size TEXT,
    response_time TEXT,
    success_rate NUMERIC(5, 2) DEFAULT '0',
    total_earnings NUMERIC(12, 2) DEFAULT '0',
    completed_projects INTEGER DEFAULT 0,
    repeat_clients INTEGER DEFAULT 0,
    profile_completion INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crypto_profiles table
CREATE TABLE IF NOT EXISTS public.crypto_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    wallet_address TEXT UNIQUE,
    wallet_provider TEXT,
    kyc_status TEXT DEFAULT 'pending',
    kyc_verified_at TIMESTAMP WITH TIME ZONE,
    trading_volume NUMERIC(15, 2) DEFAULT '0',
    total_trades INTEGER DEFAULT 0,
    average_rating NUMERIC(3, 2) DEFAULT '0',
    is_verified_trader BOOLEAN DEFAULT false,
    preferred_currencies TEXT[],
    trading_pairs JSONB,
    risk_tolerance TEXT DEFAULT 'medium',
    investment_strategy TEXT,
    notification_preferences JSONB,
    security_settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE public.marketplace_profiles 
ADD CONSTRAINT marketplace_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.freelance_profiles 
ADD CONSTRAINT freelance_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.crypto_profiles 
ADD CONSTRAINT crypto_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_profiles_user_id ON public.marketplace_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_freelance_profiles_user_id ON public.freelance_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_profiles_user_id ON public.crypto_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_profiles_is_active ON public.marketplace_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_freelance_profiles_is_available ON public.freelance_profiles(is_available);
CREATE INDEX IF NOT EXISTS idx_crypto_profiles_is_verified ON public.crypto_profiles(is_verified_trader);

-- Enable RLS (Row Level Security) on tables
ALTER TABLE public.marketplace_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelance_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own marketplace profile" ON public.marketplace_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own marketplace profile" ON public.marketplace_profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own marketplace profile" ON public.marketplace_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own freelance profile" ON public.freelance_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own freelance profile" ON public.freelance_profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own freelance profile" ON public.freelance_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own crypto profile" ON public.crypto_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own crypto profile" ON public.crypto_profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own crypto profile" ON public.crypto_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Grant necessary permissions
GRANT ALL ON public.marketplace_profiles TO authenticated;
GRANT ALL ON public.freelance_profiles TO authenticated;
GRANT ALL ON public.crypto_profiles TO authenticated;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';