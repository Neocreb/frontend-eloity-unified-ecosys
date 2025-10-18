-- Align existing Supabase DB schema with application expectations
-- Posts: ensure media_urls jsonb exists
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_urls jsonb DEFAULT '[]'::jsonb;

-- Products: ensure title exists and backfill from legacy name
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS title text;
UPDATE public.products SET title = COALESCE(title, name) WHERE title IS NULL AND name IS NOT NULL;
