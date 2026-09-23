import { createClient } from '@supabase/supabase-js';

// Enforce strict build-time environment variables with ZERO fallback to production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'CRITICAL CONFIGURATION ERROR: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be provided at build-time. Fallback to production is strictly prohibited.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

