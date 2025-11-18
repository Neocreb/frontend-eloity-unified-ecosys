-- Migration: Remove unused chat_messages_with_profiles view
-- This view was created but is not used by the application.
-- The app queries chat_messages directly and uses PostgREST
-- foreign-table relationships instead: .select('*, sender:sender_id(...)').
-- The view was causing 406 (Not Acceptable) errors from PostgREST due to
-- RLS policy incompatibilities between the joined tables.
-- Since it's unused and causing errors, we remove it.

-- Drop the view
DROP VIEW IF EXISTS public.chat_messages_with_profiles;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
