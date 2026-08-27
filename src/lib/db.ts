import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type Database = SupabaseClient;

let _supabase: Database | null = null;

/**
 * Returns the Supabase client singleton instance.
 * Automatically uses SUPABASE_SERVICE_ROLE_KEY if available (to bypass RLS for server-side logic),
 * otherwise falls back to NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
 */
export function getDatabase(): Database {
  if (_supabase) {
    return _supabase;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use service role key if available (admin mode), otherwise fallback to publishable key
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are missing (NEXT_PUBLIC_SUPABASE_URL and key).');
  }

  _supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // Don't persist session in node backend environment
    },
  });

  return _supabase;
}

/**
 * Reset helper for testing isolation.
 */
export function resetDatabase(): void {
  _supabase = null;
}
