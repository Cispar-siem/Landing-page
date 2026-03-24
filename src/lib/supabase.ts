import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Shared Supabase client instance configured from Vite environment variables.
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to be set.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
