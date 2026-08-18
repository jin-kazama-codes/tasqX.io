import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Creates (or returns cached) Supabase browser client.
 * Safe to call multiple times – re-uses the singleton.
 */
export function createClient() {
  if (supabaseClient) return supabaseClient;

  supabaseClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  return supabaseClient;
}
