-- Create profiles table
-- This migration creates the profiles table that is required for the videos table to work properly

-- Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
-- Public can view basic profile info
CREATE POLICY "Public can view basic profile info only"
ON public.profiles
FOR SELECT
USING (true);

-- Users can view their own full profile
CREATE POLICY "Users can view their own full profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add RLS policies for products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Allow public read access to products"
ON public.products
FOR SELECT
USING (true);

-- Allow authenticated users to insert their own products
CREATE POLICY "Allow users to insert their own products"
ON public.products
FOR INSERT
WITH CHECK (auth.uid() = seller_id);

-- Allow users to update their own products
CREATE POLICY "Allow users to update their own products"
ON public.products
FOR UPDATE
USING (auth.uid() = seller_id);

-- Allow users to delete their own products
CREATE POLICY "Allow users to delete their own products"
ON public.products
FOR DELETE
USING (auth.uid() = seller_id);

-- Grant necessary permissions for products table
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';