-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('seasonal', 'flash_sale', 'featured', 'category_boost', 'product_boost', 'service_boost', 'content_boost', 'profile_boost')),
  
  -- Timing
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Display
  banner_image TEXT,
  banner_text TEXT,
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#000000',
  
  -- Campaign goals and targeting
  goal_type TEXT NOT NULL CHECK (goal_type IN ('increase_sales', 'get_applications', 'promote_talent', 'get_more_views', 'drive_chats')),
  targeting JSONB DEFAULT '{}',
  estimated_reach INTEGER DEFAULT 0,
  
  -- Rules and criteria
  eligibility_criteria JSONB DEFAULT '{}',
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount', 'buy_x_get_y', NULL)),
  discount_value NUMERIC(10, 2),
  max_discount NUMERIC(10, 2),
  min_order_amount NUMERIC(10, 2),
  
  -- Limits
  max_participants INTEGER,
  max_products_per_seller INTEGER,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  
  -- Budget and payment
  budget NUMERIC(15, 2) NOT NULL,
  currency TEXT DEFAULT 'eloits' CHECK (currency IN ('eloits', 'usd', 'ngn')),
  spent NUMERIC(15, 2) DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'ended', 'cancelled')),
  is_public BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  
  -- Admin info
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Performance tracking
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  total_revenue NUMERIC(15, 2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create campaign_content table (maps content items to campaigns)
CREATE TABLE IF NOT EXISTS public.campaign_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('product', 'service', 'job', 'video', 'post', 'profile')),
  content_id UUID NOT NULL,
  
  -- Campaign-specific settings
  custom_discount NUMERIC(10, 2),
  featured_order INTEGER DEFAULT 0,
  
  -- Performance within campaign
  campaign_views INTEGER DEFAULT 0,
  campaign_clicks INTEGER DEFAULT 0,
  campaign_sales INTEGER DEFAULT 0,
  campaign_revenue NUMERIC(15, 2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(campaign_id, content_type, content_id)
);

-- Create campaign_analytics table
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  
  -- Daily metrics
  metric_date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue NUMERIC(15, 2) DEFAULT 0,
  
  -- Audience breakdown
  audience_data JSONB DEFAULT '{}',
  geographic_data JSONB DEFAULT '{}',
  device_data JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(campaign_id, metric_date)
);

-- Create campaign_performance_metrics table
CREATE TABLE IF NOT EXISTS public.campaign_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  
  -- Aggregated metrics
  total_impressions INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_revenue NUMERIC(15, 2) DEFAULT 0,
  
  -- Calculated metrics
  ctr NUMERIC(5, 2) DEFAULT 0,
  conversion_rate NUMERIC(5, 2) DEFAULT 0,
  cost_per_click NUMERIC(10, 2) DEFAULT 0,
  roi NUMERIC(10, 2) DEFAULT 0,
  
  -- Geographic performance
  top_locations JSONB DEFAULT '[]',
  top_devices JSONB DEFAULT '[]',
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON public.campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_goal_type ON public.campaigns(goal_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_start_date ON public.campaigns(start_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_end_date ON public.campaigns(end_date);
CREATE INDEX IF NOT EXISTS idx_campaign_content_campaign_id ON public.campaign_content(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_content_content_id ON public.campaign_content(content_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON public.campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_date ON public.campaign_analytics(metric_date);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns table
-- Allow users to view active campaigns
CREATE POLICY "Users can view active campaigns" ON public.campaigns
  FOR SELECT USING (status = 'active' OR created_by = auth.uid());

-- Allow users to create campaigns
CREATE POLICY "Users can create campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Allow users to update their own campaigns
CREATE POLICY "Users can update their own campaigns" ON public.campaigns
  FOR UPDATE USING (created_by = auth.uid());

-- Allow users to delete their own campaigns
CREATE POLICY "Users can delete their own campaigns" ON public.campaigns
  FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for campaign_content table
-- Allow users to view content in active campaigns
CREATE POLICY "Users can view campaign content in active campaigns" ON public.campaign_content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE id = campaign_id AND (status = 'active' OR created_by = auth.uid())
    )
  );

-- Allow users to manage content in their campaigns
CREATE POLICY "Users can manage content in their campaigns" ON public.campaign_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE id = campaign_id AND created_by = auth.uid()
    )
  );

-- RLS Policies for campaign_analytics table
-- Allow users to view analytics for their campaigns
CREATE POLICY "Users can view analytics for their campaigns" ON public.campaign_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE id = campaign_id AND created_by = auth.uid()
    )
  );

-- RLS Policies for campaign_performance_metrics table
-- Allow users to view performance metrics for their campaigns
CREATE POLICY "Users can view performance metrics for their campaigns" ON public.campaign_performance_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE id = campaign_id AND created_by = auth.uid()
    )
  );

-- Create function to update campaign updated_at timestamp
CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER campaigns_updated_at_trigger
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaigns_updated_at();

CREATE TRIGGER campaign_content_updated_at_trigger
  BEFORE UPDATE ON public.campaign_content
  FOR EACH ROW
  EXECUTE FUNCTION update_campaigns_updated_at();

CREATE TRIGGER campaign_analytics_updated_at_trigger
  BEFORE UPDATE ON public.campaign_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_campaigns_updated_at();
