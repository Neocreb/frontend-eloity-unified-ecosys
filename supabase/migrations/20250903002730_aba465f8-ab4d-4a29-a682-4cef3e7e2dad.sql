-- Secure profile visibility: restrict to authenticated users only

-- 1) Add policy for authenticated users to view profiles  
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

-- 2) Drop the existing public_profiles view if it exists
DROP VIEW IF EXISTS public.public_profiles;

-- 3) Create secure function that only returns data to authenticated users
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

-- 4) Create secure view using the function
CREATE OR REPLACE VIEW public.public_profiles_secure AS
SELECT * FROM public.get_public_profiles();

-- 5) Remove any overly permissive policies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Public profiles are viewable by everyone') THEN
    DROP POLICY "Public profiles are viewable by everyone" ON public.profiles;
  END IF;
END $$;

-- 6) Secure access permissions
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON FUNCTION public.get_public_profiles FROM anon;
REVOKE ALL ON public.public_profiles_secure FROM anon;

-- 7) Grant access to authenticated users only
GRANT SELECT ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles_secure TO authenticated;