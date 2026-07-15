import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabaseAdmin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
    // Newer Supabase projects issue an sb_secret_... key; older ones a service_role JWT.
    // Either works here — accept the common env var names for both.
    const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Supabase environment variables are not configured.')
    _supabaseAdmin = createClient(url, key)
  }
  return _supabaseAdmin
}

// Alias for convenience
export const supabaseAdmin = {
  from: (table: string) => getSupabaseAdmin().from(table),
}
