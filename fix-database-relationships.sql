-- Fix database relationships and permissions

-- 1. Add missing foreign key constraint for stories table
ALTER TABLE "stories" 
ADD CONSTRAINT "stories_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- 2. Add foreign key constraint for profiles table (if missing)
-- Note: This might already exist, so we'll use IF NOT EXISTS approach
-- First check if it exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_user_id_users_id_fk' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE "profiles" 
        ADD CONSTRAINT "profiles_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;

-- 3. Grant necessary permissions to anon role for profiles table
GRANT SELECT ON TABLE "profiles" TO anon;
GRANT ALL ON TABLE "profiles" TO authenticated;

-- 4. Create a view to help with the stories and profiles relationship
-- This can be used as a workaround if the foreign key constraint doesn't work
CREATE OR REPLACE VIEW "stories_with_profiles" AS
SELECT 
    s.*,
    p.username,
    p.full_name,
    p.avatar_url,
    p.is_verified
FROM "stories" s
LEFT JOIN "profiles" p ON s.user_id = p.user_id;

-- 5. Grant permissions for the view
GRANT SELECT ON TABLE "stories_with_profiles" TO anon;
GRANT ALL ON TABLE "stories_with_profiles" TO authenticated;

-- 6. Refresh the PostgREST schema cache
-- This notifies PostgREST to reload the schema
NOTIFY pgrst, 'reload schema';