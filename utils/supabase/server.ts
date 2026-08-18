import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a new Supabase client for use in server-side contexts
 * (API routes, Server Components, middleware).
 *
 * Call once per request – do NOT cache between requests on the server.
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
