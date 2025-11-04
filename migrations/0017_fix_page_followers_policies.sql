-- Migration: Fix page_followers RLS policies to resolve 406 error
-- Date: 2025-11-04

-- Drop existing policies that were causing 406 Not Acceptable errors
DROP POLICY IF EXISTS "Anyone can view page followers" ON public.page_followers;
DROP POLICY IF EXISTS "Users can follow pages" ON public.page_followers;
DROP POLICY IF EXISTS "Users can unfollow pages" ON public.page_followers;

-- Create proper policies with correct USING and WITH CHECK conditions
-- This fixes the "new row violates row-level security policy" error
CREATE POLICY "Anyone can view page followers" ON public.page_followers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can follow pages" ON public.page_followers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow pages" ON public.page_followers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';