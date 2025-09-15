-- Just clean up the invalid data since constraints might already exist
DELETE FROM groups WHERE creator_id = '00000000-0000-0000-0000-000000000000';
DELETE FROM products WHERE seller_id = '00000000-0000-0000-0000-000000000000';