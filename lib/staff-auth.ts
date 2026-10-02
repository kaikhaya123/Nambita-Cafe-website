import { cookies } from 'next/headers'
import { getAccount, rolePassword, type StaffRole } from '@/lib/staff-accounts'
import { secretFingerprint, signToken, verifyToken } from '@/lib/security/tokens'

// Server-only. Dashboard sessions (the login cookie) for staff and managers.
// The cookie holds a signed account id + session version; every check re-reads the
// account, so deactivating someone logs them out everywhere at once.
// It also holds a fingerprint of their role's shared password, so changing
// STAFF_DASHBOARD_PASSWORD or MANAGER_DASHBOARD_PASSWORD logs everyone in that role out.

type SessionData = { id: string; v: number; s?: string }

/** Fingerprint of a role's current shared password, or null if that role can't log in. */
export function currentPasswordKey(role: StaffRole) {
  const password = rolePassword(role)
  return password ? secretFingerprint(password) : null
}

export type { StaffRole } from '@/lib/staff-accounts'

export const STAFF_COOKIE_NAME = 'nc_staff_session'
export const SESSION_TTL_MS = 14 * 60 * 60 * 1000 // one long shift
const SESSION_PURPOSE = 'staff-session'

export interface StaffSession {
  accountId: string
  role: StaffRole
  /** Shown in the side menu's "Logged in as". */
  name: string
}

/** `passwordKey` comes from currentPasswordKey(role) at the moment they log in. */
export function createStaffSessionToken(accountId: string, sessionVersion: number, passwordKey: string) {
  const data: SessionData = { id: accountId, v: sessionVersion, s: passwordKey }
  return {
    token: signToken(SESSION_PURPOSE, data, SESSION_TTL_MS),
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

export async function getStaffSession(): Promise<StaffSession | null> {
  const cookieStore = await cookies()
  const data = verifyToken<SessionData>(SESSION_PURPOSE, cookieStore.get(STAFF_COOKIE_NAME)?.value)
  if (!data) return null

  try {
    const account = await getAccount(data.id)
    if (!account || !account.is_active || account.session_version !== data.v) return null
    // Their role's shared password must still be the one they logged in with.
    const key = currentPasswordKey(account.role)
    if (!key || data.s !== key) return null
    return { accountId: account.id, role: account.role, name: account.name }
  } catch (error) {
    console.error('Failed to load staff session', error)
    return null
  }
}

export async function isStaffAuthenticated() {
  return (await getStaffSession()) !== null
}
