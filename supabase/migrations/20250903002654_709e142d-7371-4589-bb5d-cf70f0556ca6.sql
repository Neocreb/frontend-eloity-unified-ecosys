-- Secure profile visibility: restrict to authenticated users only

-- 1) First, secure the main profiles table for authenticated-only viewing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Authenticated users can view profiles') THEN
    CREATE POLICY "Authenticated users can view profiles" 
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- 2) Since public_profiles is a view, we need to secure it differently
-- First, drop the existing view if it exists
DROP VIEW IF EXISTS public.public_profiles;

-- 3) Recreate the public_profiles view with security definer function
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone,
  is_verified boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only return data if user is authenticated
  SELECT 
    p.user_id,
    p.username,
    p.full_name as display_name,
    p.avatar_url,
    p.created_at,
    p.is_verified
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL;  -- Require authentication
$$;

-- 4) Create a new secure view that uses the function
CREATE OR REPLACE VIEW public.public_profiles_secure AS
SELECT * FROM public.get_public_profiles();

-- 5) Enable RLS on profiles table (already done, but ensuring)
-- profiles table already has RLS enabled per existing schema

-- 6) Remove any overly permissive policies and ensure proper access control
-- Check if there are any public read policies that need to be removed
DO $$
BEGIN
  -- Remove any policies that allow public (anon) access to profiles
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Public profiles are viewable by everyone') THEN
    DROP POLICY "Public profiles are viewable by everyone" ON public.profiles;
  END IF;
END $$;

-- 7) Ensure anonymous users have no access
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.get_public_profiles() FROM anon;
REVOKE ALL ON public.public_profiles_secure FROM anon;

-- 8) Grant appropriate access to authenticated users
GRANT SELECT ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profiles() TO authenticated;
GRANT SELECT ON public.public_profiles_secure TO authenticated;