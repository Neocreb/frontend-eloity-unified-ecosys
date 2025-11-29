-- Fix missing foreign key constraint for post_comments.user_id -> profiles.id relationship
-- This resolves the "Could not find a relationship between 'post_comments' and 'user_id'" error
-- when trying to join post_comments with profiles using the REST API

-- Add foreign key constraint for user_id referencing profiles.id (if it doesn't exist)
DO $$
BEGIN
    -- First check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'post_comments_user_id_profiles_fkey' 
        AND table_name = 'post_comments'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE "post_comments" 
        ADD CONSTRAINT "post_comments_user_id_profiles_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") 
        ON DELETE CASCADE ON UPDATE NO ACTION;
        RAISE NOTICE 'Added foreign key constraint: post_comments.user_id -> profiles.id';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists: post_comments_user_id_profiles_fkey';
    END IF;
END $$;

-- Refresh the PostgREST schema cache to recognize the new relationship
NOTIFY pgrst, 'reload schema';
