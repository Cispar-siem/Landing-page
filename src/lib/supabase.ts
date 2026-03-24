import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

/**
 * Returns the shared Supabase client, or null if env vars are not configured.
 * Lazy initialization prevents crashes when VITE_SUPABASE_URL is not set.
 */
export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !key) return null;
  _client = createClient(url, key);
  return _client;
}
