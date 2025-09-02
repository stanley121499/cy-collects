/**
 * Supabase client singleton
 * - Uses environment variables for URL and anon key
 * - Exposes a typed client bound to our Database schema
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

// Validate env variables early with clear errors to aid debugging
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.error(
    "Missing Supabase env vars. Ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set."
  );
}

/**
 * getSupabaseClient
 * Returns a memoized Supabase client instance strictly typed to our schema.
 */
let client: SupabaseClient<Database> | null = null;
export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (client) return client;
  client = createClient<Database>(SUPABASE_URL ?? "", SUPABASE_ANON_KEY ?? "", {
    auth: { persistSession: false },
  });
  return client;
};

export type TypedSupabaseClient = SupabaseClient<Database>;


