// Server-only. Limits how often something can happen (e.g. checkouts per visitor) using the
// hit_rate_limit function from supabase/migrations/005_rate_limits.sql.

import { createHash } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * The visitor's internet address, as reported by Vercel. It's hashed before being stored,
 * so the database never holds real IP addresses.
 */
export function clientAddressKey(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const address = forwarded || request.headers.get('x-real-ip') || 'unknown'
  return createHash('sha256').update(address).digest('hex').slice(0, 32)
}

/**
 * Counts one attempt for `key` and returns true if it's allowed (still within `limit` per `windowSeconds`).
 *
 * If the database can't be reached, or the 005 migration hasn't been run yet, this lets the
 * request through and logs the problem. Blocking real customers would be worse than not limiting.
 */
export async function isWithinRateLimit(key: string, limit: number, windowSeconds: number) {
  try {
    const { data, error } = await getSupabaseAdmin().rpc('hit_rate_limit', {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    })
    if (error) throw error
    return data !== false
  } catch (error) {
    console.error(`Rate limit check failed for "${key.split(':')[0]}" — allowing the request`, error)
    return true
  }
}
