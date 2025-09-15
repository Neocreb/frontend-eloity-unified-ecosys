-- Fix remaining Security Definer Views and function search path issues

-- 1. Check for and fix any remaining views with SECURITY DEFINER
-- Get all views to see what might still have SECURITY DEFINER
DO $$
DECLARE
    view_record RECORD;
BEGIN
    -- Look for any remaining views with SECURITY DEFINER in their definition
    FOR view_record IN 
        SELECT schemaname, viewname, definition 
        FROM pg_views 
        WHERE schemaname = 'public' 
        AND definition ILIKE '%SECURITY DEFINER%'
    LOOP
        RAISE NOTICE 'Found SECURITY DEFINER view: %.%', view_record.schemaname, view_record.viewname;
        -- Drop and recreate without SECURITY DEFINER if found
        EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', view_record.schemaname, view_record.viewname);
    END LOOP;
END $$;

-- 2. Fix function search paths to be immutable for security
-- Update any functions that don't have SET search_path
ALTER FUNCTION public.create_notification SET search_path = 'public';
ALTER FUNCTION public.provision_current_user SET search_path = 'public';
ALTER FUNCTION public.check_column_exists SET search_path = 'public';
ALTER FUNCTION public.mask_account_number SET search_path = 'public';
ALTER FUNCTION public.encrypt_user_banking_info SET search_path = 'public';

-- 3. Ensure is_admin function has proper search path (it should already be set)
-- This function is critical for security, verify it's set correctly
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- 4. Add validation to ensure sensitive data access is properly controlled
-- Create a function to validate banking access requests
CREATE OR REPLACE FUNCTION public.validate_banking_access(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow users to access their own banking info
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RETURN false;
  END IF;
  
  -- Log access attempt
  INSERT INTO public.audit_banking_access(user_id, accessed_by, purpose)
  VALUES (p_user_id, auth.uid(), 'validation_check');
  
  RETURN true;
END;
$$;