-- Add missing columns required by application
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';
