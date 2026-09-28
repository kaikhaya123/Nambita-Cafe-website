import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

// Server-only. Authenticator-app codes (TOTP, RFC 6238): SHA-1, 6 digits, 30-second steps —
// the defaults every authenticator app (Google, Microsoft, Authy, 1Password) supports.

const STEP_SECONDS = 30
const DIGITS = 6
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function base32Encode(bytes: Buffer) {
  let bits = 0
  let value = 0
  let output = ''
  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  return output
}

export function base32Decode(input: string) {
  const clean = input.replace(/=+$/, '').replace(/\s+/g, '').toUpperCase()
  let bits = 0
  let value = 0
  const bytes: number[] = []
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char)
    if (index === -1) throw new Error('Invalid base32 character')
    value = (value << 5) | index
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return Buffer.from(bytes)
}

/** A new 160-bit secret, base32-encoded for authenticator apps. */
export function generateTotpSecret() {
  return base32Encode(randomBytes(20))
}

function hotp(secret: Buffer, counter: number) {
  const buffer = Buffer.alloc(8)
  buffer.writeBigUInt64BE(BigInt(counter))
  const hmac = createHmac('sha1', secret).update(buffer).digest()
  const offset = hmac[hmac.length - 1] & 0x0f
  const binary = hmac.readUInt32BE(offset) & 0x7fffffff
  return String(binary % 10 ** DIGITS).padStart(DIGITS, '0')
}

export function currentTotpStep(nowMs = Date.now()) {
  return Math.floor(nowMs / 1000 / STEP_SECONDS)
}

export function totpCode(secretBase32: string, step = currentTotpStep()) {
  return hotp(base32Decode(secretBase32), step)
}

/**
 * Checks a 6-digit code, allowing one step either side for phone clock drift.
 * Returns the matched time-step (store it to block reuse), or null.
 */
export function verifyTotp(secretBase32: string, code: string, lastUsedStep: number | null = null, nowMs = Date.now()) {
  const cleaned = code.replace(/\s+/g, '')
  if (!/^\d{6}$/.test(cleaned)) return null
  const secret = base32Decode(secretBase32)
  const step = currentTotpStep(nowMs)
  for (const candidate of [step - 1, step, step + 1]) {
    if (lastUsedStep !== null && candidate <= lastUsedStep) continue
    const expected = Buffer.from(hotp(secret, candidate))
    if (timingSafeEqual(expected, Buffer.from(cleaned))) return candidate
  }
  return null
}

/** The otpauth:// link an authenticator app reads from the QR code. */
export function totpUri(secretBase32: string, accountName: string, issuer = 'Nambita Cafe') {
  const label = encodeURIComponent(`${issuer}:${accountName}`)
  const params = new URLSearchParams({
    secret: secretBase32,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  })
  return `otpauth://totp/${label}?${params.toString()}`
}
