import { cookies } from 'next/headers'
import { getAccount, type StaffRole } from '@/lib/staff-accounts'
import { signToken, verifyToken } from '@/lib/security/tokens'

// Server-only. Dashboard sessions for personal staff/manager accounts.
// The cookie holds a signed account id + session version; every check re-reads the
// account, so deactivating or resetting someone logs them out everywhere at once.

export type { StaffRole } from '@/lib/staff-accounts'

export const STAFF_COOKIE_NAME = 'nc_staff_session'
export const SESSION_TTL_MS = 14 * 60 * 60 * 1000 // one long shift
const SESSION_PURPOSE = 'staff-session'

export interface StaffSession {
  accountId: string
  role: StaffRole
  /** Shown in the dashboard header's "Logged in as". */
  name: string
}

export function createStaffSessionToken(accountId: string, sessionVersion: number) {
  return {
    token: signToken(SESSION_PURPOSE, { id: accountId, v: sessionVersion }, SESSION_TTL_MS),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  }
}

export const sessionCookieOptions = (expires: Date) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  expires,
})

// ---- Two-step login: password first, then authenticator code on its own page ----

export const LOGIN_CHALLENGE_COOKIE = 'nc_login_challenge'
const CHALLENGE_PURPOSE = 'login-challenge'
const CHALLENGE_TTL_MS = 5 * 60 * 1000

/** Issued after a correct password; only lets the person reach the code page. */
export function createLoginChallenge(accountId: string, sessionVersion: number) {
  return {
    token: signToken(CHALLENGE_PURPOSE, { id: accountId, v: sessionVersion }, CHALLENGE_TTL_MS),
    cookieOptions: { ...sessionCookieOptions(new Date(Date.now() + CHALLENGE_TTL_MS)), path: '/' },
  }
}

export function readLoginChallenge(token: string | undefined) {
  return verifyToken<{ id: string; v: number }>(CHALLENGE_PURPOSE, token)
}

/** The account waiting on the code page, or null if the password step expired. */
export async function getPendingLogin() {
  const cookieStore = await cookies()
  const challenge = readLoginChallenge(cookieStore.get(LOGIN_CHALLENGE_COOKIE)?.value)
  if (!challenge) return null
  try {
    const account = await getAccount(challenge.id)
    if (!account || !account.is_active || account.session_version !== challenge.v) return null
    return { accountId: account.id, name: account.name, role: account.role }
  } catch (error) {
    console.error('Failed to load pending login', error)
    return null
  }
}

export async function getStaffSession(): Promise<StaffSession | null> {
  const cookieStore = await cookies()
  const data = verifyToken<{ id: string; v: number }>(SESSION_PURPOSE, cookieStore.get(STAFF_COOKIE_NAME)?.value)
  if (!data) return null

  try {
    const account = await getAccount(data.id)
    if (!account || !account.is_active || account.session_version !== data.v) return null
    return { accountId: account.id, role: account.role, name: account.name }
  } catch (error) {
    console.error('Failed to load staff session', error)
    return null
  }
}

export async function isStaffAuthenticated() {
  return (await getStaffSession()) !== null
}
