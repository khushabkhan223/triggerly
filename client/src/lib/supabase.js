import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('⚠️ VITE_SUPABASE_URL not set — auth features will not work. See client/.env.example')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
