-- Secure profile visibility: restrict to authenticated users only

-- 1) Ensure RLS is enabled on public_profiles and profiles
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;
-- profiles already has RLS enabled per schema, but we re-assert safely
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2) Add SELECT policy on profiles for authenticated users to view all profiles
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

-- Keep existing self-only INSERT/UPDATE policies as-is

-- 3) Add SELECT policy on public_profiles for authenticated users only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'public_profiles' 
      AND policyname = 'Authenticated users can view public profiles') THEN
    CREATE POLICY "Authenticated users can view public profiles" 
    ON public.public_profiles
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Do not create INSERT/UPDATE/DELETE policies on public_profiles to prevent direct writes

-- 4) Optional hardening: ensure no anonymous access by explicitly revoking grant (RLS covers API, but for safety)
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.public_profiles FROM anon;

-- 5) Improve mask function search_path stability (address linter warning if present)
CREATE OR REPLACE FUNCTION public.mask_account_number(acct text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF acct IS NULL OR length(acct) < 4 THEN
    RETURN NULL;
  END IF;
  RETURN repeat('*', GREATEST(length(acct) - 4, 0)) || right(acct, 4);
END;
$$;