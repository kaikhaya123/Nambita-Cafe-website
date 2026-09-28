import { createHash, createHmac, randomInt, timingSafeEqual } from 'node:crypto'

// Server-only. Signed tokens (sessions, setup hand-off) and one-time setup codes.

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

// No 0/O/1/I/L so codes are easy to read out loud or copy from a note.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** A one-time setup code like "K7P2M-QX9TD" (~50 bits of randomness). */
export function generateSetupCode() {
  const chars = Array.from({ length: 10 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)])
  return `${chars.slice(0, 5).join('')}-${chars.slice(5).join('')}`
}

export function normalizeSetupCode(code: string) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function hashSetupCode(code: string) {
  return createHash('sha256').update(normalizeSetupCode(code)).digest('hex')
}
