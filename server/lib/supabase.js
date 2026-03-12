import { createClient } from '@supabase/supabase-js'

let _supabase = null

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server .env')
      process.exit(1)
    }

    _supabase = createClient(url, key)
  }
  return _supabase
}

// For convenience — getter that lazily initializes
export const supabase = new Proxy({}, {
  get(_, prop) {
    return getSupabase()[prop]
  }
})
