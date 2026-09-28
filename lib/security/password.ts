import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto'

// Server-only. Password hashing with scrypt (memory-hard, built into Node).
// Stored as: scrypt$N$r$p$saltBase64$hashBase64

const KEY_LENGTH = 64
const PARAMS = { N: 16384, r: 8, p: 1 }

export const MIN_PASSWORD_LENGTH = 8

function derive(password: string, salt: Buffer, options: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, { ...options, maxmem: 64 * 1024 * 1024 }, (error, key) =>
      error ? reject(error) : resolve(key)
    )
  })
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const hash = await derive(password, salt, PARAMS)
  return ['scrypt', PARAMS.N, PARAMS.r, PARAMS.p, salt.toString('base64'), hash.toString('base64')].join('$')
}

export async function verifyPassword(password: string, stored: string | null) {
  if (!stored) return false
  const [scheme, n, r, p, saltB64, hashB64] = stored.split('$')
  if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false
  const expected = Buffer.from(hashB64, 'base64')
  const actual = await derive(password, Buffer.from(saltB64, 'base64'), { N: Number(n), r: Number(r), p: Number(p) })
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

/** Returns an error message, or null if the password is acceptable. */
export function passwordProblem(password: string, confirm: string) {
  if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  if (password.length > 200) return 'Password is too long.'
  if (password !== confirm) return 'Passwords do not match.'
  return null
}
