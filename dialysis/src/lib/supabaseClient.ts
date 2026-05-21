import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate config
export const isSupabaseConfigured = 
  Boolean(supabaseUrl) && 
  Boolean(supabaseAnonKey) && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

// Initialize client if configured, otherwise export null/dummy client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

console.log(
  isSupabaseConfigured 
    ? '⚡ Supabase is configured and connected.' 
    : 'ℹ️ Supabase credentials not found. Running in high-fidelity local Sandbox/Demo Mode.'
);
