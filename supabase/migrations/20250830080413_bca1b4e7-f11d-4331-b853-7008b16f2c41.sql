-- 1) Ensure public_profiles is accessible with proper RLS
-- Enable RLS (idempotent-safe)
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Public profiles are viewable by everyone' AND schemaname='public' AND tablename='public_profiles'
  ) THEN
    CREATE POLICY "Public profiles are viewable by everyone"
    ON public.public_profiles
    FOR SELECT
    USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Users can insert their own public profile' AND schemaname='public' AND tablename='public_profiles'
  ) THEN
    CREATE POLICY "Users can insert their own public profile"
    ON public.public_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Users can update their own public profile' AND schemaname='public' AND tablename='public_profiles'
  ) THEN
    CREATE POLICY "Users can update their own public profile"
    ON public.public_profiles
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2) Realtime: ensure key tables stream full row data and are in supabase_realtime publication
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname='public' AND tablename='chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname='public' AND tablename='chat_conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname='public' AND tablename='posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname='public' AND tablename='notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- 3) Performance indexes for realtime-heavy flows (idempotent with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_chat_messages_convo_created_at 
  ON public.chat_messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_created_at 
  ON public.posts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON public.notifications (user_id, created_at DESC) WHERE NOT read;

-- 4) Auto-update updated_at columns using existing function public.update_updated_at_column()
-- Create triggers only if they don't already exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_posts_updated_at') THEN
    CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
    CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_events_updated_at') THEN
    CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_trades_updated_at') THEN
    CREATE TRIGGER update_trades_updated_at
    BEFORE UPDATE ON public.trades
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_wallets_updated_at') THEN
    CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON public.wallets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_banking_info_updated_at') THEN
    CREATE TRIGGER update_user_banking_info_updated_at
    BEFORE UPDATE ON public.user_banking_info
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_preferences_updated_at') THEN
    CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_scores_updated_at') THEN
    CREATE TRIGGER update_user_scores_updated_at
    BEFORE UPDATE ON public.user_scores
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_streaks_updated_at') THEN
    CREATE TRIGGER update_user_streaks_updated_at
    BEFORE UPDATE ON public.user_streaks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_trading_limits_updated_at') THEN
    CREATE TRIGGER update_trading_limits_updated_at
    BEFORE UPDATE ON public.trading_limits
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 5) Secure provisioning function to create baseline rows for new users
CREATE OR REPLACE FUNCTION public.provision_current_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- profiles
  INSERT INTO public.profiles (user_id)
  SELECT uid
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = uid
  );

  -- wallets
  INSERT INTO public.wallets (user_id)
  SELECT uid
  WHERE NOT EXISTS (
    SELECT 1 FROM public.wallets w WHERE w.user_id = uid
  );

  -- user_preferences
  INSERT INTO public.user_preferences (user_id)
  SELECT uid
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_preferences up WHERE up.user_id = uid
  );

  -- user_scores
  INSERT INTO public.user_scores (user_id)
  SELECT uid
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_scores us WHERE us.user_id = uid
  );
END;
$$;

-- Allow authenticated users to call the provisioning function via RPC
-- (No direct policy needed for functions; RLS applies on underlying tables)
