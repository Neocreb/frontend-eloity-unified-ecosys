import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.REPLACE_ENV_SUPABASE_SERVICE_ROLE || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.warn('Supabase service not configured. Set SUPABASE_SERVICE_ROLE and SUPABASE_URL to enable server-side pushes.');
}

export const supabaseServer = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE || '', {
  auth: { persistSession: false },
  global: {}
});

export default supabaseServer;
