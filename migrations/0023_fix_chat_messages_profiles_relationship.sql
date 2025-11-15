-- Migration: Fix chat_messages to profiles relationship
-- This migration creates a view that joins chat_messages with profiles tables
-- to enable proper JOIN operations in PostgREST

-- Create a view that joins chat_messages with profiles
CREATE OR REPLACE VIEW public.chat_messages_with_profiles AS
SELECT 
    cm.*,
    p.id as profile_id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.is_verified,
    p.level,
    p.points,
    p.role
FROM public.chat_messages cm
LEFT JOIN public.profiles p ON cm.sender_id = p.user_id;

-- Grant necessary permissions
GRANT ALL ON public.chat_messages_with_profiles TO authenticated;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';