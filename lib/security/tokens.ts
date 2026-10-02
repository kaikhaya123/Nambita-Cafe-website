import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

// Server-only. Signed tokens (the login cookie), safe secret comparison and password fingerprints.

function getSecret() {
  const secret = process.env.DASHBOARD_SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('DASHBOARD_SESSION_SECRET is missing or shorter than 32 characters.')
  }
  return secret
}

export function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  return aBuf.length === bBuf.length && timingSafeEqual(aBuf, bBuf)
}

/** Constant-time exact comparison of two secrets of any length (e.g. passwords from env). */
export function secretsMatch(candidate: string, expected: string) {
  const digest = (value: string) => createHash('sha256').update(value).digest()
  return timingSafeEqual(digest(candidate), digest(expected))
}

function sign(purpose: string, payload: string) {
  return createHmac('sha256', getSecret()).update(`${purpose}:${payload}`).digest('base64url')
}

/**
 * A short fingerprint of a secret (e.g. a role's shared password), safe to put inside a login token:
 * it can't be turned back into the secret without DASHBOARD_SESSION_SECRET. If the secret changes,
 * so does the fingerprint, which is how changing a role's password logs everyone in that role out.
 */
export function secretFingerprint(value: string) {
  return sign('fingerprint', value).slice(0, 16)
}

/** Encodes JSON with an expiry and an HMAC signature scoped to `purpose`. */
export function signToken(purpose: string, data: object, ttlMs: number) {
  const payload = Buffer.from(JSON.stringify({ ...data, exp: Date.now() + ttlMs })).toString('base64url')
  return `${payload}.${sign(purpose, payload)}`
}

export function verifyToken<T>(purpose: string, token: string | undefined): T | null {
  if (!token) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature || !safeEqual(signature, sign(purpose, payload))) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as T & { exp?: number }
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null
    return data
  } catch {
    return null
  }
}
