-- Fix missing foreign key constraints for post_comments table
-- This will resolve the "Could not find a relationship between 'post_comments' and 'user_id'" error

-- Add foreign key constraint for user_id referencing users.id (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'post_comments_user_id_fkey' 
        AND table_name = 'post_comments'
    ) THEN
        ALTER TABLE "post_comments" 
        ADD CONSTRAINT "post_comments_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;

-- Add foreign key constraint for parent_id referencing post_comments.id (for nested comments) (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'post_comments_parent_id_fkey' 
        AND table_name = 'post_comments'
    ) THEN
        ALTER TABLE "post_comments" 
        ADD CONSTRAINT "post_comments_parent_id_fkey" 
        FOREIGN KEY ("parent_id") REFERENCES "public"."post_comments"("id") ON DELETE no action ON UPDATE no action;
    END IF;
END $$;

-- Enable RLS on post_comments table (if not already enabled)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'post_comments' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE "post_comments" ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create policies for post_comments (if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'post_comments' 
        AND policyname = 'Users can view post comments'
    ) THEN
        CREATE POLICY "Users can view post comments" ON "post_comments"
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.posts 
                WHERE posts.id = post_comments.post_id 
                AND posts.user_id = auth.uid()
            )
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'post_comments' 
        AND policyname = 'Users can create post comments'
    ) THEN
        CREATE POLICY "Users can create post comments" ON "post_comments"
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.posts 
                WHERE posts.id = post_comments.post_id 
                AND posts.user_id = auth.uid()
            ) AND auth.uid() = user_id
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'post_comments' 
        AND policyname = 'Users can update their post comments'
    ) THEN
        CREATE POLICY "Users can update their post comments" ON "post_comments"
        FOR UPDATE USING (
            auth.uid() = user_id
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'post_comments' 
        AND policyname = 'Users can delete their post comments'
    ) THEN
        CREATE POLICY "Users can delete their post comments" ON "post_comments"
        FOR DELETE USING (
            auth.uid() = user_id
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'post_comments' 
        AND policyname = 'Admins can manage post comments'
    ) THEN
        CREATE POLICY "Admins can manage post comments" ON "post_comments"
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.admin_users 
                WHERE admin_users.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- Grant necessary permissions (if not already granted)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.role_table_grants 
        WHERE table_name = 'post_comments' 
        AND grantee = 'authenticated' 
        AND privilege_type = 'INSERT'
    ) THEN
        GRANT ALL ON public.post_comments TO authenticated;
    END IF;
END $$;

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';