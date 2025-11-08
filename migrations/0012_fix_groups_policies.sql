-- Migration: Fix groups and group members policies
-- Date: 2025-11-01

-- Enable RLS on groups and group_members tables if not already enabled
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view groups they created" ON public.groups;
DROP POLICY IF EXISTS "Users can view public groups" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON public.groups;
DROP POLICY IF EXISTS "Group creators can delete their groups" ON public.groups;

DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;

-- Create proper policies for groups table
CREATE POLICY "Users can view groups they created" ON public.groups
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can view public groups" ON public.groups
  FOR SELECT USING (privacy_level = 'public');

CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" ON public.groups
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their groups" ON public.groups
  FOR DELETE USING (auth.uid() = created_by);

-- Create proper policies for group_members table
CREATE POLICY "Users can view group members" ON public.group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = group_members.group_id 
      AND (groups.privacy_level = 'public' OR groups.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can join groups" ON public.group_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = group_members.group_id 
      AND groups.privacy_level IN ('public', 'unlisted')
    )
  );

CREATE POLICY "Users can leave groups" ON public.group_members
  FOR DELETE USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.group_members gm 
      JOIN public.groups g ON g.id = gm.group_id
      WHERE gm.group_id = group_members.group_id 
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
      AND g.created_by = auth.uid()
    )
  );

CREATE POLICY "Group admins can manage members" ON public.group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_members.group_id 
      AND (g.created_by = auth.uid() OR
           EXISTS (SELECT 1 FROM public.group_members gm 
                   WHERE gm.group_id = g.id 
                   AND gm.user_id = auth.uid()
                   AND gm.role IN ('admin', 'moderator')))
    )
  );

-- Grant necessary permissions
GRANT ALL ON public.groups TO authenticated;
GRANT ALL ON public.group_members TO authenticated;

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';