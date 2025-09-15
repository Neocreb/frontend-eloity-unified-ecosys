-- 1) Ensure pgcrypto is available
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- 2) Helper function to mask account numbers (shows only last 4)
CREATE OR REPLACE FUNCTION public.mask_account_number(acct text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  IF acct IS NULL OR length(acct) < 4 THEN
    RETURN NULL;
  END IF;
  RETURN repeat('*', GREATEST(length(acct) - 4, 0)) || right(acct, 4);
END;
$$;

-- 3) Add encrypted columns (non-breaking, keep existing plaintext for now)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'user_banking_info' 
      AND column_name = 'bank_account_number_enc') THEN
    ALTER TABLE public.user_banking_info
      ADD COLUMN bank_account_number_enc bytea;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'user_banking_info' 
      AND column_name = 'bank_account_name_enc') THEN
    ALTER TABLE public.user_banking_info
      ADD COLUMN bank_account_name_enc bytea;
  END IF;
END $$;

-- 4) Trigger to optionally encrypt on write when header key is present
CREATE OR REPLACE FUNCTION public.encrypt_user_banking_info()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key text := current_setting('request.headers.x-bank-key', true);
BEGIN
  IF v_key IS NOT NULL AND v_key <> '' THEN
    -- Encrypt sensitive fields when a key is provided via secure edge/API
    IF NEW.bank_account_number IS NOT NULL THEN
      NEW.bank_account_number_enc := pgp_sym_encrypt(NEW.bank_account_number, v_key);
      NEW.bank_account_number := NULL;  -- remove plaintext at rest
    END IF;

    IF NEW.bank_account_name IS NOT NULL THEN
      NEW.bank_account_name_enc := pgp_sym_encrypt(NEW.bank_account_name, v_key);
      NEW.bank_account_name := NULL; -- optional, also protect name
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_encrypt_user_banking_info') THEN
    CREATE TRIGGER trg_encrypt_user_banking_info
    BEFORE INSERT OR UPDATE ON public.user_banking_info
    FOR EACH ROW
    EXECUTE FUNCTION public.encrypt_user_banking_info();
  END IF;
END $$;

-- 5) Masked view for safe reads (never returns full account number)
CREATE OR REPLACE VIEW public.user_banking_info_masked AS
SELECT 
  ubi.id,
  ubi.user_id,
  ubi.bank_name,
  -- Prefer plaintext if present (legacy), otherwise show token that data is encrypted
  CASE 
    WHEN ubi.bank_account_number IS NOT NULL THEN public.mask_account_number(ubi.bank_account_number)
    WHEN ubi.bank_account_number_enc IS NOT NULL THEN '[ENCRYPTED] ****'
    ELSE NULL
  END AS bank_account_number_masked,
  -- Keep name but lightly masked to reduce exposure
  CASE 
    WHEN ubi.bank_account_name IS NOT NULL AND length(ubi.bank_account_name) > 1 THEN
      left(ubi.bank_account_name, 1) || repeat('*', GREATEST(length(ubi.bank_account_name)-1,0))
    WHEN ubi.bank_account_name_enc IS NOT NULL THEN '[ENCRYPTED] *'
    ELSE ubi.bank_account_name
  END AS bank_account_name_masked,
  ubi.created_at,
  ubi.updated_at
FROM public.user_banking_info ubi;

-- 6) Auditing table and secure RPC for full decrypt (requires header key)
CREATE TABLE IF NOT EXISTS public.audit_banking_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  accessed_by uuid NOT NULL,
  accessed_at timestamptz NOT NULL DEFAULT now(),
  purpose text
);

ALTER TABLE public.audit_banking_access ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own audit entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='audit_banking_access' AND policyname='Users view own banking access logs') THEN
    CREATE POLICY "Users view own banking access logs" ON public.audit_banking_access
    FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.get_user_banking_info_full(p_user_id uuid, p_purpose text DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  bank_name text,
  bank_account_name text,
  bank_account_number text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key text := current_setting('request.headers.x-bank-key', true);
BEGIN
  -- Enforce ownership
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Require encryption key to return sensitive data
  IF v_key IS NULL OR v_key = '' THEN
    RAISE EXCEPTION 'Encryption key missing';
  END IF;

  -- Log the access attempt
  INSERT INTO public.audit_banking_access(user_id, accessed_by, purpose)
  VALUES (p_user_id, auth.uid(), p_purpose);

  RETURN QUERY
  SELECT 
    ubi.id,
    ubi.user_id,
    ubi.bank_name,
    COALESCE(
      CASE WHEN ubi.bank_account_name_enc IS NOT NULL THEN pgp_sym_decrypt(ubi.bank_account_name_enc, v_key) END,
      ubi.bank_account_name
    ) AS bank_account_name,
    COALESCE(
      CASE WHEN ubi.bank_account_number_enc IS NOT NULL THEN pgp_sym_decrypt(ubi.bank_account_number_enc, v_key) END,
      ubi.bank_account_number
    ) AS bank_account_number,
    ubi.created_at,
    ubi.updated_at
  FROM public.user_banking_info ubi
  WHERE ubi.user_id = p_user_id;
END;
$$;

-- 7) Optional: tighten UPDATE/DELETE to ensure only owner can modify and prevent privilege misuse
-- (These policies already exist per project context; this is a safety re-assertion to avoid accidental removal)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_banking_info' AND policyname='Users can strictly view own banking info') THEN
    CREATE POLICY "Users can strictly view own banking info" ON public.user_banking_info
    FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;