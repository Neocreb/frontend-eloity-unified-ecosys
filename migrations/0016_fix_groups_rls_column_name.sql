-- Migration: Fix groups table column name in RLS policies
-- Date: 2025-11-04

-- Drop existing policies that reference the wrong column name
DROP POLICY IF EXISTS "Users can view public groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;

-- Create proper policies for groups table with correct column name
CREATE POLICY "Users can view public groups" ON public.groups
  FOR SELECT USING (privacy = 'public');

-- Create proper policies for group_members table with correct column name
CREATE POLICY "Users can view group members" ON public.group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = group_members.group_id 
      AND (groups.privacy = 'public' OR groups.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can join groups" ON public.group_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = group_members.group_id 
      AND groups.privacy IN ('public', 'unlisted')
    )
  );

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';