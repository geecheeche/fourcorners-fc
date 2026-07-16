import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabaseAdmin: SupabaseClient | null = null

// A publishable/anon key is subject to row-level security, which silently
// returns zero rows here instead of erroring. Catch that misconfiguration
// up front — the server must use the secret (service-role) key.
function assertServerKey(key: string) {
  if (key.startsWith('sb_publishable_')) {
    throw new Error('The Supabase PUBLISHABLE key is configured, but the server needs the SECRET key (sb_secret_...). Swap the key in your environment variables.')
  }
  if (key.startsWith('eyJ')) {
    try {
      const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64').toString())
      if (payload.role === 'anon') {
        throw new Error('The Supabase ANON key is configured, but the server needs the service_role (or sb_secret_...) key. Swap the key in your environment variables.')
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('ANON key')) throw e
      // Not a decodable JWT — let Supabase reject it if it's invalid
    }
  }
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
    // Newer Supabase projects issue an sb_secret_... key; older ones a service_role JWT.
    // Either works here — accept the common env var names for both.
    const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Supabase environment variables are not configured.')
    assertServerKey(key)
    _supabaseAdmin = createClient(url, key)
  }
  return _supabaseAdmin
}

// Alias for convenience
export const supabaseAdmin = {
  from: (table: string) => getSupabaseAdmin().from(table),
}
