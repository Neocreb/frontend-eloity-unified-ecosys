-- Fix: remove SECURITY DEFINER usage for public profiles access and use invoker view with RLS on base table

-- 1) Ensure SELECT for profiles is restricted to authenticated users (already added previously)
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

-- 2) Drop secure view/function variants introduced earlier
DROP VIEW IF EXISTS public.public_profiles_secure;
DROP FUNCTION IF EXISTS public.get_public_profiles;

-- 3) Recreate a simple invoker view with the original, stable name
-- If a view named public_profiles exists already, drop and replace it
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT 
  p.user_id,
  p.username,
  p.full_name AS display_name,
  p.avatar_url,
  p.created_at,
  p.is_verified
FROM public.profiles p;

-- 4) Tighten privileges: no anon access, allow authenticated
REVOKE ALL ON public.public_profiles FROM anon;
GRANT SELECT ON public.public_profiles TO authenticated;