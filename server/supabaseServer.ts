let supabaseServer: any = null;

try {
  // lazy require to avoid crashing when env not set during dev
  const { createClient } = await import('@supabase/supabase-js');
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.REPLACE_ENV_SUPABASE_SERVICE_ROLE || '';

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    console.warn('Supabase service not configured. Set SUPABASE_SERVICE_ROLE and SUPABASE_URL to enable server-side pushes.');
  } else {
    supabaseServer = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
      auth: { persistSession: false },
      global: {}
    });
  }
} catch (err) {
  console.warn('Supabase client not initialized:', err?.message || err);
}

export { supabaseServer };
export default supabaseServer;
