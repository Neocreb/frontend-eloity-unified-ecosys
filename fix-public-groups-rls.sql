-- Fix: Allow users to view public group chat threads
-- Issue: RLS policy was too restrictive - only members could see groups
-- Solution: Add policy to allow anyone to view public groups

-- Add policy to allow viewing public groups
CREATE POLICY "Users can view public group chat threads" ON public.group_chat_threads
    FOR SELECT USING (
        privacy = 'public'
        OR EXISTS (
            SELECT 1 FROM public.group_participants 
            WHERE group_participants.group_id = group_chat_threads.id 
            AND group_participants.user_id = auth.uid()
        )
    );

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
