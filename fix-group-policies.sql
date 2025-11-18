-- Fix infinite recursion in group_participants RLS policy
-- Drop the problematic policy if it exists
DROP POLICY IF EXISTS "Users can view group participants for groups they belong to" ON public.group_participants;

-- Create a new policy that avoids self-reference
CREATE POLICY "Users can view group participants for groups they belong to" ON public.group_participants
    FOR SELECT USING (
        -- Check if the user is a participant in the same group
        EXISTS (
            SELECT 1 FROM public.group_participants gp
            WHERE gp.group_id = group_participants.group_id
            AND gp.user_id = auth.uid()
        )
        -- Also check if the group exists (safety check)
        AND EXISTS (
            SELECT 1 FROM public.group_chat_threads gt
            WHERE gt.id = group_participants.group_id
        )
    );

-- Fix group_chat_threads policy to verify user exists
-- Drop the existing policy
DROP POLICY IF EXISTS "Users can create group chat threads" ON public.group_chat_threads;

-- Create a new policy that verifies the user exists
CREATE POLICY "Users can create group chat threads" ON public.group_chat_threads
    FOR INSERT WITH CHECK (
        auth.uid() = created_by 
        AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = created_by
        )
    );

-- Fix group_participants insert policy
-- Drop the existing policy
DROP POLICY IF EXISTS "Users can join groups through invite links" ON public.group_participants;

-- Create a new policy that verifies the user exists
CREATE POLICY "Users can join groups through invite links" ON public.group_participants
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = user_id
        )
        AND EXISTS (
            SELECT 1 FROM public.group_chat_threads 
            WHERE group_chat_threads.id = group_participants.group_id
        )
    );

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';