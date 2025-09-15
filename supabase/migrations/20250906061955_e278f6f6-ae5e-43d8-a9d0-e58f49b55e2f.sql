-- Fix foreign key relationships for groups and products tables
-- Add foreign key constraints to link with profiles table

-- Add foreign key constraint for groups.creator_id -> profiles.user_id
ALTER TABLE groups 
ADD CONSTRAINT groups_creator_id_fkey 
FOREIGN KEY (creator_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Add foreign key constraint for products.seller_id -> profiles.user_id  
ALTER TABLE products
ADD CONSTRAINT products_seller_id_fkey
FOREIGN KEY (seller_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_groups_creator_id ON groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);