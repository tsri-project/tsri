import { createClient } from '@supabase/supabase-js';

const supabaseUrl = typeof window !== 'undefined' 
  ? (window as any).ENV?.SUPABASE_URL || 'https://mock.supabase.co'
  : process.env.SUPABASE_URL || 'https://mock.supabase.co';

const supabaseAnonKey = typeof window !== 'undefined'
  ? (window as any).ENV?.SUPABASE_ANON_KEY || 'mock-anon-key'
  : process.env.SUPABASE_ANON_KEY || 'mock-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
