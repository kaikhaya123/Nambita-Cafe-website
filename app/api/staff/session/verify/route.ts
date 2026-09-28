// POST /api/staff/session/verify — staff login, step 2 of 2: checks the 6-digit authenticator code
// and, if it's right, sets the login cookie.

import { NextRequest, NextResponse } from 'next/server'
import { slowDown } from '@/lib/api-response'
import { getAccount, isLocked, recordFailedAttempt, updateAccount } from '@/lib/staff-accounts'
import {
  createStaffSessionToken,
  LOGIN_CHALLENGE_COOKIE,
  readLoginChallenge,
  sessionCookieOptions,
  STAFF_COOKIE_NAME,
} from '@/lib/staff-auth'
import { verifyTotp } from '@/lib/security/totp'

const EXPIRED = 'Your login timed out. Please enter your password again.'

// Needs the short-lived challenge cookie set by a correct password in step 1.
export async function POST(request: NextRequest) {
  const challenge = readLoginChallenge(request.cookies.get(LOGIN_CHALLENGE_COOKIE)?.value)
  if (!challenge) return NextResponse.json({ error: EXPIRED, restart: true }, { status: 401 })

  const body = (await request.json().catch(() => null)) as { code?: unknown } | null
  const code = typeof body?.code === 'string' ? body.code : ''

  let account
  try {
    account = await getAccount(challenge.id)
  } catch (error) {
    console.error('Failed to load account for code check', error)
    return NextResponse.json({ error: 'Could not sign in right now. Please try again.' }, { status: 500 })
  }

  if (!account || !account.is_active || account.session_version !== challenge.v || !account.totp_secret) {
    return NextResponse.json({ error: EXPIRED, restart: true }, { status: 401 })
  }
  if (isLocked(account)) {
    const response = NextResponse.json(
      { error: 'Too many attempts. This account is locked for 15 minutes — try again later.', restart: true },
      { status: 429 }
    )
    response.cookies.delete(LOGIN_CHALLENGE_COOKIE)
    return response
  }

  const step = verifyTotp(account.totp_secret, code, account.last_totp_step)
  if (step === null) {
    await recordFailedAttempt(account).catch((error) => console.error('Failed to record code attempt', error))
    await slowDown()
    return NextResponse.json(
      { error: 'That code isn’t right. Enter the newest 6-digit code for Nambita Cafe.' },
      { status: 401 }
    )
  }

  try {
    await updateAccount(account.id, { failed_attempts: 0, locked_until: null, last_totp_step: step })
  } catch (error) {
    // Don't log in if the used code can't be recorded, or it could be replayed.
    console.error('Failed to record successful code check', error)
    return NextResponse.json({ error: 'Could not sign in right now. Please try again.' }, { status: 500 })
  }

  const { token, expiresAt } = createStaffSessionToken(account.id, account.session_version)
  const response = NextResponse.json({
    ok: true,
    role: account.role,
    next: account.role === 'manager' ? '/dashboard/sales' : '/dashboard',
  })
  response.cookies.set(STAFF_COOKIE_NAME, token, sessionCookieOptions(expiresAt))
  response.cookies.delete(LOGIN_CHALLENGE_COOKIE)
  return response
}
