-- Migration: Add currency settings to profiles table
-- Description: Adds preferred_currency and auto_detect_currency fields to track user currency preferences

-- Add columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS auto_detect_currency BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS currency_updated_at TIMESTAMP DEFAULT NOW();

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_currency 
ON profiles(preferred_currency);

-- Create a function to update currency_updated_at
CREATE OR REPLACE FUNCTION update_currency_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.currency_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update currency_updated_at
DROP TRIGGER IF EXISTS trigger_update_currency_updated_at ON profiles;
CREATE TRIGGER trigger_update_currency_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
WHEN (OLD.preferred_currency IS DISTINCT FROM NEW.preferred_currency)
EXECUTE FUNCTION update_currency_updated_at();

-- Add comments for documentation
COMMENT ON COLUMN profiles.preferred_currency IS 'User selected currency code (e.g., USD, NGN, EUR). Default is USD.';
COMMENT ON COLUMN profiles.auto_detect_currency IS 'Whether to automatically detect and use currency based on user location. Default is true.';
COMMENT ON COLUMN profiles.currency_updated_at IS 'Timestamp when currency preferences were last updated.';
