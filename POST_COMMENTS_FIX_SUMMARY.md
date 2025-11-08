# Post Comments Fix Summary

## Issue
The application was encountering the following errors when trying to fetch or create comments on posts:

```
Error fetching comments: 
{code: 'PGRST200', details: "Searched for a foreign key relationship between 'post_comments' and 'user_id' in the schema 'public', but no matches were found.", hint: null, message: "Could not find a relationship between 'post_comments' and 'user_id' in the schema cache"}

Error adding comment: 
{code: 'PGRST200', details: "Searched for a foreign key relationship between 'post_comments' and 'user_id' in the schema 'public', but no matches were found.", hint: null, message: "Could not find a relationship between 'post_comments' and 'user_id' in the schema cache"}
```

## Root Cause
The `post_comments` table was missing some foreign key constraints that define relationships with other tables:
1. No foreign key constraint for `post_comments.user_id` referencing `users.id` (this was the main issue)
2. No foreign key constraint for `post_comments.parent_id` referencing `post_comments.id` (for nested comments)
3. No Row Level Security (RLS) policies defined for the table

Note: The foreign key constraint for `post_comments.post_id` referencing `posts.id` already existed.

## Solution
Created migration `0019_fix_post_comments_foreign_keys.sql` with the following changes:

### 1. Added Foreign Key Constraints (with existence checks)
```sql
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
```

### 2. Enabled Row Level Security (RLS) (with existence check)
```sql
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
```

### 3. Added RLS Policies (with existence checks)
```sql
-- Users can view comments on posts they own
CREATE POLICY "Users can view post comments" ON "post_comments"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_comments.post_id 
            AND posts.user_id = auth.uid()
        )
    );

-- Users can create comments on their own posts
CREATE POLICY "Users can create post comments" ON "post_comments"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_comments.post_id 
            AND posts.user_id = auth.uid()
        ) AND auth.uid() = user_id
    );

-- Users can update their own comments
CREATE POLICY "Users can update their post comments" ON "post_comments"
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- Users can delete their own comments
CREATE POLICY "Users can delete their post comments" ON "post_comments"
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- Admins can manage all comments
CREATE POLICY "Admins can manage post comments" ON "post_comments"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE admin_users.user_id = auth.uid()
        )
    );
```

### 4. Granted Permissions (with existence check)
```sql
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
```

### 5. Refreshed Schema Cache
```sql
-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
```

## Verification
After applying this migration, the foreign key relationships will be properly defined, allowing PostgREST to understand how to join tables when querying post comments. The RLS policies ensure proper access control while the granted permissions allow authenticated users to interact with the table.

The error should be resolved as PostgREST will now be able to:
1. Understand the relationship between `post_comments` and `users` tables (through `user_id`)
2. Understand the relationship between `post_comments` and itself for nested comments (through `parent_id`)
3. Properly enforce access control through RLS policies

Note: The relationship between `post_comments` and `posts` tables was already properly defined through the existing foreign key constraint.