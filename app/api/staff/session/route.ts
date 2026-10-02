import { NextRequest, NextResponse } from 'next/server'
import { slowDown } from '@/lib/api-response'
import {
  getAccount,
  isLocked,
  isSetUp,
  isStaffRole,
  recordFailedAttempt,
  staffDashboardPassword,
  updateAccount,
  usesAuthenticator,
} from '@/lib/staff-accounts'
import {
  createLoginChallenge,
  createStaffSessionToken,
  currentStaffPasswordKey,
  LOGIN_CHALLENGE_COOKIE,
  sessionCookieOptions,
  STAFF_COOKIE_NAME,
} from '@/lib/staff-auth'
import { verifyPassword } from '@/lib/security/password'
import { secretsMatch } from '@/lib/security/tokens'

// POST: check the password.
//   - Staff: the shared staff password (STAFF_DASHBOARD_PASSWORD) logs them straight in (no authenticator).
//   - Managers: a correct password only unlocks the authenticator-code page
//     (/nambita-staff-access/verify, finished by ./verify); it does not log them in yet.
// DELETE: log out.
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { accountId?: unknown; role?: unknown; password?: unknown }
    | null
  const accountId = typeof body?.accountId === 'string' ? body.accountId : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!isStaffRole(body?.role)) {
    return NextResponse.json({ error: 'Please choose Staff or Manager.' }, { status: 400 })
  }

  let account
  try {
    account = await getAccount(accountId)
  } catch (error) {
    console.error('Failed to load account for login', error)
    return NextResponse.json({ error: 'Could not sign in right now. Please try again.' }, { status: 500 })
  }

  if (!account || !account.is_active || account.role !== body.role) {
    await slowDown()
    return NextResponse.json({ error: 'Please choose your name from the list.' }, { status: 400 })
  }
  const isManager = usesAuthenticator(account.role)
  if (!isSetUp(account)) {
    return NextResponse.json(
      {
        error: isManager
          ? 'Your account is not set up yet. Ask another manager for a setup code.'
          : 'Staff login isn’t switched on yet. Ask HQ (a manager) to set the staff password.',
        needsSetup: true,
      },
      { status: 403 }
    )
  }
  if (isLocked(account)) {
    return NextResponse.json(
      { error: 'Too many attempts. This account is locked for 15 minutes — try again later.' },
      { status: 429 }
    )
  }

  // Managers: their own password. Staff: the one shared staff password from the server settings.
  const sharedStaffPassword = staffDashboardPassword()
  const passwordOk = isManager
    ? await verifyPassword(password, account.password_hash)
    : sharedStaffPassword !== null && secretsMatch(password.trim(), sharedStaffPassword)

  if (!passwordOk) {
    await recordFailedAttempt(account).catch((error) => console.error('Failed to record login attempt', error))
    await slowDown()
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
  }

  if (!isManager) {
    // Staff: log in now. Clear any earlier wrong attempts first.
    try {
      await updateAccount(account.id, { failed_attempts: 0, locked_until: null })
    } catch (error) {
      console.error('Failed to reset login attempts', error)
      return NextResponse.json({ error: 'Could not sign in right now. Please try again.' }, { status: 500 })
    }
    const staffPasswordKey = currentStaffPasswordKey() ?? undefined
    const { token, expiresAt } = createStaffSessionToken(account.id, account.session_version, staffPasswordKey)
    const response = NextResponse.json({ ok: true, role: account.role, next: '/dashboard' })
    response.cookies.set(STAFF_COOKIE_NAME, token, sessionCookieOptions(expiresAt))
    response.cookies.delete(LOGIN_CHALLENGE_COOKIE)
    return response
  }

  // Manager: go on to the authenticator-code page.
  const { token, cookieOptions } = createLoginChallenge(account.id, account.session_version)
  const response = NextResponse.json({ ok: true, next: '/nambita-staff-access/verify' })
  response.cookies.set(LOGIN_CHALLENGE_COOKIE, token, cookieOptions)
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(STAFF_COOKIE_NAME)
  response.cookies.delete(LOGIN_CHALLENGE_COOKIE)
  return response
}
