-- Migration: Create posts and post_comments tables
-- This migration creates the missing posts and post_comments tables with proper foreign key constraints

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT,
    media_urls JSONB,
    type TEXT DEFAULT 'text',
    privacy TEXT DEFAULT 'public',
    location TEXT,
    hashtags TEXT[],
    mentions TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID,
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints for post_comments
DO $$
BEGIN
    -- Add foreign key constraint for post_id referencing posts.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'post_comments_post_id_fkey' 
        AND table_name = 'post_comments'
    ) THEN
        ALTER TABLE "post_comments" 
        ADD CONSTRAINT "post_comments_post_id_fkey" 
        FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;

    -- Add foreign key constraint for user_id referencing users.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'post_comments_user_id_fkey' 
        AND table_name = 'post_comments'
    ) THEN
        ALTER TABLE "post_comments" 
        ADD CONSTRAINT "post_comments_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;

    -- Add foreign key constraint for parent_id referencing post_comments.id (for nested comments)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'post_comments_parent_id_fkey' 
        AND table_name = 'post_comments'
    ) THEN
        ALTER TABLE "post_comments" 
        ADD CONSTRAINT "post_comments_parent_id_fkey" 
        FOREIGN KEY ("parent_id") REFERENCES "public"."post_comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_is_deleted ON public.posts(is_deleted);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON public.post_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON public.post_comments(created_at);

-- Enable RLS (Row Level Security) on tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'posts' 
        AND policyname = 'Users can view public posts'
    ) THEN
        CREATE POLICY "Users can view public posts" ON "posts"
        FOR SELECT USING (
            privacy = 'public' 
            OR user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.followers 
                WHERE followers.following_id = posts.user_id 
                AND followers.follower_id = auth.uid()
            )
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'posts' 
        AND policyname = 'Users can create posts'
    ) THEN
        CREATE POLICY "Users can create posts" ON "posts"
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'posts' 
        AND policyname = 'Users can update their posts'
    ) THEN
        CREATE POLICY "Users can update their posts" ON "posts"
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'posts' 
        AND policyname = 'Users can delete their posts'
    ) THEN
        CREATE POLICY "Users can delete their posts" ON "posts"
        FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create policies for post_comments
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
                AND (
                    posts.privacy = 'public' 
                    OR posts.user_id = auth.uid()
                    OR EXISTS (
                        SELECT 1 FROM public.followers 
                        WHERE followers.following_id = posts.user_id 
                        AND followers.follower_id = auth.uid()
                    )
                )
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
            auth.uid() = user_id
            AND EXISTS (
                SELECT 1 FROM public.posts 
                WHERE posts.id = post_comments.post_id 
                AND posts.is_deleted = false
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
        AND policyname = 'Users can update their post comments'
    ) THEN
        CREATE POLICY "Users can update their post comments" ON "post_comments"
        FOR UPDATE USING (auth.uid() = user_id);
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
        FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON public.posts TO authenticated;
GRANT ALL ON public.post_comments TO authenticated;

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';