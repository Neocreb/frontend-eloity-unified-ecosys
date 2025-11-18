-- Setup user provisioning hook for automatic user creation
-- This trigger will automatically create entries in users and profiles tables when a new user signs up

-- Create the function that will be called when a new user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (
    id,
    email,
    username,
    full_name,
    avatar_url,
    banner_url,
    bio,
    location,
    website,
    phone,
    date_of_birth,
    gender,
    is_verified,
    points,
    level,
    role,
    reputation,
    followers_count,
    following_count,
    posts_count,
    profile_views,
    is_online,
    last_active,
    profile_visibility,
    allow_direct_messages,
    allow_notifications,
    preferred_currency,
    timezone,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    false,
    0,
    'bronze',
    'user',
    0,
    0,
    0,
    0,
    0,
    false,
    NULL,
    'public',
    true,
    true,
    'USDT',
    NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into profiles table
  INSERT INTO public.profiles (
    user_id,
    name,
    avatar,
    bio,
    role,
    status,
    preferences,
    username,
    full_name,
    avatar_url,
    is_verified,
    points,
    level,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NULL,
    NULL,
    NULL,
    'user',
    'active',
    '{}'::jsonb,
    NULL,
    NULL,
    NULL,
    false,
    0,
    'bronze',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert into wallets table
  INSERT INTO public.wallets (
    user_id,
    btc_balance,
    eth_balance,
    sol_balance,
    usdt_balance,
    eloity_points_balance,
    kyc_verified,
    kyc_level,
    kyc_documents,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    0,
    0,
    0,
    0,
    0,
    false,
    0,
    '{}'::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger that calls the function when a new user is created
-- This trigger runs after a new user is inserted into auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';