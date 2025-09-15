-- First, clean up invalid data before applying foreign key constraints
-- Delete groups with invalid creator_id values
DELETE FROM groups WHERE creator_id = '00000000-0000-0000-0000-000000000000';
DELETE FROM products WHERE seller_id = '00000000-0000-0000-0000-000000000000';

-- Now add the foreign key constraints safely
ALTER TABLE groups 
ADD CONSTRAINT groups_creator_id_fkey 
FOREIGN KEY (creator_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE products
ADD CONSTRAINT products_seller_id_fkey
FOREIGN KEY (seller_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_groups_creator_id ON groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);