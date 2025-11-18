-- Fix post_comments RLS policies to allow users to view comments on posts they have access to

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view post comments" ON "post_comments";
DROP POLICY IF EXISTS "Users can create post comments" ON "post_comments";
DROP POLICY IF EXISTS "Users can update their post comments" ON "post_comments";
DROP POLICY IF EXISTS "Users can delete their post comments" ON "post_comments";
DROP POLICY IF EXISTS "Admins can manage post comments" ON "post_comments";

-- Create improved SELECT policy - allow viewing comments on accessible posts
CREATE POLICY "Users can view post comments" ON "post_comments"
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.posts 
        WHERE posts.id = post_comments.post_id 
        AND posts.is_deleted = false
        AND (
            posts.privacy = 'public' 
            OR posts.user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.followers 
                WHERE followers.following_id = posts.user_id 
                AND followers.follower_id = auth.uid()
            )
            OR (
                SELECT auth.role() = 'authenticated'
            )
        )
    )
);

-- Create INSERT policy - allow creating comments on non-deleted posts
CREATE POLICY "Users can create post comments" ON "post_comments"
FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1 FROM public.posts 
        WHERE posts.id = post_comments.post_id 
        AND posts.is_deleted = false
    )
);

-- Create UPDATE policy - allow updating own comments
CREATE POLICY "Users can update their post comments" ON "post_comments"
FOR UPDATE USING (
    auth.uid() = user_id
)
WITH CHECK (
    auth.uid() = user_id
);

-- Create DELETE policy - allow deleting own comments
CREATE POLICY "Users can delete their post comments" ON "post_comments"
FOR DELETE USING (
    auth.uid() = user_id
);

-- Create admin policy
CREATE POLICY "Admins can manage post comments" ON "post_comments"
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE admin_users.user_id = auth.uid()
    )
);

-- Ensure grants are in place
GRANT SELECT ON public.post_comments TO authenticated;
GRANT INSERT ON public.post_comments TO authenticated;
GRANT UPDATE ON public.post_comments TO authenticated;
GRANT DELETE ON public.post_comments TO authenticated;

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
