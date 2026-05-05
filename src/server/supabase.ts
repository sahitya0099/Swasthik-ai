// Supabase client singleton for server-side use.
// Reads credentials from VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env vars.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type { SupabaseClient };

// Type definitions matching our Supabase tables
export interface IngredientRow {
  id: number;
  name: string;
  category: "good" | "moderate" | "harmful";
  health_effect: string;
  risk_level: "low" | "medium" | "high";
  aliases: string[] | null;
  risk_flag: string | null;
}

export interface AnalysisHistoryRow {
  id?: number;
  input_text: string;
  score: number;
  verdict: string;
  timestamp?: string;
}

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;

  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
    );
  }

  _client = createClient(url, key);
  return _client;
}
