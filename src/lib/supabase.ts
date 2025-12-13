import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
// These need to be prefixed with VITE_ to be exposed to the frontend
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a Supabase client for the browser
// Note: This uses the anon key, not the service key
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}
