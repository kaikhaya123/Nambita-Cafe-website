import { NextRequest, NextResponse } from 'next/server'
import { slowDown } from '@/lib/api-response'
import { getAccount, isLocked, isStaffRole, recordFailedAttempt } from '@/lib/staff-accounts'
import { createLoginChallenge, LOGIN_CHALLENGE_COOKIE, STAFF_COOKIE_NAME } from '@/lib/staff-auth'
import { verifyPassword } from '@/lib/security/password'

// POST: login step 1 — check the password. Success only unlocks the authenticator-code page
// (/nambita-staff-access/verify, finished by ./verify); it does not log anyone in.
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
  if (!account.password_hash || !account.totp_secret) {
    return NextResponse.json(
      { error: 'Your account is not set up yet. Ask a manager for a setup code.', needsSetup: true },
      { status: 403 }
    )
  }
  if (isLocked(account)) {
    return NextResponse.json(
      { error: 'Too many attempts. This account is locked for 15 minutes — try again later.' },
      { status: 429 }
    )
  }

  if (!(await verifyPassword(password, account.password_hash))) {
    await recordFailedAttempt(account).catch((error) => console.error('Failed to record login attempt', error))
    await slowDown()
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
  }

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
