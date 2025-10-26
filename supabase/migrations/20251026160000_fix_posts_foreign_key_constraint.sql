-- Fix the foreign key constraint on the posts table
-- The posts table should reference the users table, not the profiles table

-- First, drop the incorrect constraint if it exists
ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "posts_user_id_profiles_fkey";

-- Ensure the correct constraint exists
-- This will add the constraint if it doesn't exist
ALTER TABLE "posts" 
ADD CONSTRAINT "posts_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';