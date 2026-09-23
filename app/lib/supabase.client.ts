import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof window !== 'undefined' && (window as any).ENV?.SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  'https://aatlledgsftkjfunqsvh.supabase.co';

const supabaseAnonKey =
  (typeof window !== 'undefined' && (window as any).ENV?.SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhdGxsZWRnc2Z0a2pmdW5xc3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMDQzOTAsImV4cCI6MjEwNTU4MDM5MH0.0j7Lc6-mbG0s0OT6cb9mjb5yi2W-7deEIqwmQFjscRo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
