-- Setup user provisioning hook for automatic user creation
-- This trigger will automatically create entries in users and profiles tables when a new user signs up

-- Create the function that will be called when a new user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, email, email_confirmed, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.email_confirmed, false),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into profiles table
  INSERT INTO public.profiles (
    user_id,
    username,
    full_name,
    name,
    bio,
    avatar,
    avatar_url,
    is_verified,
    level,
    points,
    role,
    status,
    bank_account_name,
    bank_account_number,
    bank_name,
    preferences,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    false,
    'bronze',
    0,
    'user',
    'active',
    NULL,
    NULL,
    NULL,
    '{}'::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert into wallets table
  INSERT INTO public.wallets (
    user_id,
    usdt_balance,
    eth_balance,
    btc_balance,
    soft_points_balance,
    is_active,
    is_frozen,
    freeze_reason,
    frozen_by,
    frozen_at,
    backup_seed,
    last_backup_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    '0',
    '0',
    '0',
    '0',
    true,
    false,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
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