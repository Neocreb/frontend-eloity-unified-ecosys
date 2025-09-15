-- Fix security linter issues
-- 1) Make public view INVOKER to avoid security-definer view problem
ALTER VIEW public.public_profiles SET (security_invoker = true);

-- 2) Set stable search_path for function without it
CREATE OR REPLACE FUNCTION public.check_column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO public
AS $$
DECLARE
  column_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = $1
      AND column_name = $2
  ) INTO column_exists;
  RETURN column_exists;
END;
$$;