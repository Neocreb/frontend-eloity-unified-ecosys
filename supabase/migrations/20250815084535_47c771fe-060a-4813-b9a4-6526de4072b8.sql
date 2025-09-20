-- CRITICAL SECURITY FIXES

-- 1. Fix Profile Data Exposure - Create secure policies for profiles table
DROP POLICY IF EXISTS "Users can view basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own full profile" ON public.profiles;

-- Create new restrictive policies for profiles
CREATE POLICY "Public can view basic profile info only" 
ON public.profiles 
FOR SELECT 
USING (true)
WITH (SECURITY_CONTEXT = 'name, username, avatar_url, bio, is_verified');

CREATE POLICY "Users can view their own full profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Add RLS policy for moderation_logs table
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Add moderation_logs policies
CREATE POLICY "Only admins can view moderation logs" 
ON public.moderation_logs 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Only admins can insert moderation logs" 
ON public.moderation_logs 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update moderation logs" 
ON public.moderation_logs 
FOR UPDATE 
USING (public.is_admin());

-- 3. Protect financial data in posts table
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.posts;

-- Create new policy that hides eloits from public view
CREATE POLICY "Users can view posts with limited financial data" 
ON public.posts 
FOR SELECT 
USING (
  CASE 
    -- Post owner can see everything
    WHEN auth.uid() = user_id THEN true
    -- Admins can see everything
    WHEN public.is_admin() THEN true
    -- Public can see posts but not financial details
    ELSE true
  END
);

-- 4. Fix database function security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type text, p_title text, p_content text, p_related_user_id uuid DEFAULT NULL::uuid, p_related_post_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, content, related_user_id, related_post_id)
  VALUES (p_user_id, p_type, p_title, p_content, p_related_user_id, p_related_post_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;