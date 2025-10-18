-- Migration: create content_analytics table
CREATE TABLE IF NOT EXISTS public.content_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL,
  source_id uuid NOT NULL,
  title text NOT NULL,
  type text NOT NULL,
  platform text NOT NULL,
  publish_date timestamptz DEFAULT now(),
  views integer DEFAULT 0,
  engagement text,
  revenue numeric(12,2) DEFAULT 0,
  analytics jsonb,
  thumbnail text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Optional: create index for faster queries
-- Ensure publish_date exists to avoid index creation failure on legacy tables
ALTER TABLE public.content_analytics ADD COLUMN IF NOT EXISTS publish_date timestamptz DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_content_analytics_publish_date ON public.content_analytics(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_content_analytics_type ON public.content_analytics(type);

-- Row level security: allow anon/select through policies only if desired. Below are example policies that allow read for all and insert/update for service role only.
-- Enable RLS (disabled by default)
-- ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;

-- Example policy: allow public selects
-- CREATE POLICY "allow_select_all" ON public.content_analytics FOR SELECT USING (true);

-- Example policy for upsert by service role: you will need a policy to restrict by a claim or use supabase service role which bypasses RLS.

-- NOTE: To manage RLS properly, configure policies in Supabase SQL editor or Admin UI per your security model.
