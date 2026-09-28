import { signToken, verifyToken } from '@/lib/security/tokens'

// Server-only. Short-lived signed hand-off between the two setup steps, so the new
// authenticator secret is only saved once the person proves their app shows the right code.

const SETUP_PURPOSE = 'staff-setup'
const SETUP_TOKEN_TTL_MS = 15 * 60 * 1000

export type SetupTicket =
  | { kind: 'account'; accountId: string; secret: string; codeHash: string }
  | { kind: 'first-manager'; name: string; secret: string }

export function createSetupToken(ticket: SetupTicket) {
  return signToken(SETUP_PURPOSE, ticket, SETUP_TOKEN_TTL_MS)
}

export function readSetupToken(token: unknown) {
  return typeof token === 'string' ? verifyToken<SetupTicket>(SETUP_PURPOSE, token) : null
}

/** Groups a base32 key in fours so it's easier to type into an authenticator app. */
export function formatManualKey(secret: string) {
  return secret.match(/.{1,4}/g)?.join(' ') ?? secret
}
