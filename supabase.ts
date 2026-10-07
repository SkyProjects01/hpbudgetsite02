import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  '';

const supabaseAnonKey =
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
