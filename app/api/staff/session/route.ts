// /api/staff/session — the dashboard login.
// POST: check the password and log in. Staff type STAFF_DASHBOARD_PASSWORD and managers type
//   MANAGER_DASHBOARD_PASSWORD (both from the server settings). 5 wrong tries lock that name for 15 minutes.
// DELETE: log out.

import { NextRequest, NextResponse } from 'next/server'
import { slowDown } from '@/lib/api-response'
import {
  getAccount,
  isLocked,
  isStaffRole,
  recordFailedAttempt,
  rolePassword,
  rolePasswordSettingName,
  updateAccount,
} from '@/lib/staff-accounts'
import { createStaffSessionToken, currentPasswordKey, sessionCookieOptions, STAFF_COOKIE_NAME } from '@/lib/staff-auth'
import { secretsMatch } from '@/lib/security/tokens'

const SIGN_IN_FAILED = 'Could not sign in right now. Please try again.'

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
    return NextResponse.json({ error: SIGN_IN_FAILED }, { status: 500 })
  }

  if (!account || !account.is_active || account.role !== body.role) {
    await slowDown()
    return NextResponse.json({ error: 'Please choose your name from the list.' }, { status: 400 })
  }

  const expected = rolePassword(account.role)
  if (!expected) {
    console.error(`${rolePasswordSettingName(account.role)} is missing or shorter than 8 characters — ${account.role} login is off.`)
    return NextResponse.json(
      { error: 'This login isn’t switched on yet. Ask HQ to set the password.', needsSetup: true },
      { status: 403 }
    )
  }
  if (isLocked(account)) {
    return NextResponse.json(
      { error: 'Too many attempts. This account is locked for 15 minutes — try again later.' },
      { status: 429 }
    )
  }

  if (!secretsMatch(password.trim(), expected)) {
    await recordFailedAttempt(account).catch((error) => console.error('Failed to record login attempt', error))
    await slowDown()
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
  }

  // Correct: clear any earlier wrong attempts, then log in.
  try {
    await updateAccount(account.id, { failed_attempts: 0, locked_until: null })
  } catch (error) {
    console.error('Failed to reset login attempts', error)
    return NextResponse.json({ error: SIGN_IN_FAILED }, { status: 500 })
  }

  const passwordKey = currentPasswordKey(account.role)!
  const { token, expiresAt } = createStaffSessionToken(account.id, account.session_version, passwordKey)
  const response = NextResponse.json({
    ok: true,
    role: account.role,
    next: account.role === 'manager' ? '/dashboard/sales' : '/dashboard',
  })
  response.cookies.set(STAFF_COOKIE_NAME, token, sessionCookieOptions(expiresAt))
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(STAFF_COOKIE_NAME)
  return response
}
