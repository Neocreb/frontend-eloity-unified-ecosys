-- Migration: enable RLS and example policies for content_analytics
-- NOTE: Supabase service_role bypasses RLS so server upserts will work even when RLS is enabled.

ALTER TABLE IF EXISTS public.content_analytics ENABLE ROW LEVEL SECURITY;

-- Allow public selects (adjust to your application needs — you may restrict to authenticated users)
CREATE POLICY IF NOT EXISTS "allow_select_all" ON public.content_analytics
  FOR SELECT
  USING (true);

-- Disallow inserts/updates/deletes from anon by default. Service role (server) bypasses RLS.
-- Example: allow inserts only when jwt claim has role = 'service' (custom claim) or when authenticated
-- CREATE POLICY "service_insert" ON public.content_analytics
--   FOR INSERT
--   USING (auth.role() = 'service');

-- Recommended: manage strict policies via Supabase dashboard for your project's security model.
