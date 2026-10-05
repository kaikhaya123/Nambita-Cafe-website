// /api/staff/session — the dashboard login.
// POST: check the name and password and log in. Staff type STAFF_DASHBOARD_PASSWORD and managers type
//   MANAGER_DASHBOARD_PASSWORD (both from the server settings).
//   - Each visitor (internet address) gets 20 tries every 15 minutes, so nobody can guess endlessly.
//   - 5 wrong passwords lock that name for 15 minutes.
//   - A wrong name and a wrong password get the same answer, so the form can't be used to find out who works here.
// DELETE: log out.

import { NextRequest, NextResponse } from 'next/server'
import { slowDown } from '@/lib/api-response'
import { clientAddressKey, isWithinRateLimit } from '@/lib/rate-limit'
import {
  cleanStaffName,
  getAccountByName,
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
const WRONG_NAME_OR_PASSWORD = 'Name or password is incorrect.'

// Login tries per visitor. A whole shift logging in from the cafe's wifi shares one address, so this
// is set high enough for that, but far too low for anyone trying to guess the password.
const LOGINS_PER_ADDRESS = 20
const LOGIN_WINDOW_SECONDS = 15 * 60

export async function POST(request: NextRequest) {
  if (!(await isWithinRateLimit(`login:ip:${clientAddressKey(request)}`, LOGINS_PER_ADDRESS, LOGIN_WINDOW_SECONDS))) {
    return NextResponse.json({ error: 'Too many login attempts. Please wait 15 minutes and try again.' }, { status: 429 })
  }

  const body = (await request.json().catch(() => null)) as
    | { name?: unknown; role?: unknown; password?: unknown }
    | null
  const name = cleanStaffName(body?.name)
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!isStaffRole(body?.role)) {
    return NextResponse.json({ error: 'Please choose Staff or Manager.' }, { status: 400 })
  }
  if (!name || !password) {
    return NextResponse.json({ error: 'Please enter your name and the password.' }, { status: 400 })
  }

  // Checked before looking up the name: it's about the whole role, so it says nothing about who works here.
  const expected = rolePassword(body.role)
  if (!expected) {
    console.error(`${rolePasswordSettingName(body.role)} is missing or shorter than 8 characters — ${body.role} login is off.`)
    return NextResponse.json(
      { error: 'This login isn’t switched on yet. Ask HQ to set the password.', needsSetup: true },
      { status: 403 }
    )
  }

  let account
  try {
    account = await getAccountByName(name)
  } catch (error) {
    console.error('Failed to load account for login', error)
    return NextResponse.json({ error: SIGN_IN_FAILED }, { status: 500 })
  }

  if (!account || !account.is_active || account.role !== body.role) {
    await slowDown()
    return NextResponse.json({ error: WRONG_NAME_OR_PASSWORD }, { status: 401 })
  }
  if (isLocked(account)) {
    return NextResponse.json(
      { error: 'Too many wrong passwords for this name. Try again in 15 minutes.' },
      { status: 429 }
    )
  }

  if (!secretsMatch(password.trim(), expected)) {
    await recordFailedAttempt(account).catch((error) => console.error('Failed to record login attempt', error))
    await slowDown()
    return NextResponse.json({ error: WRONG_NAME_OR_PASSWORD }, { status: 401 })
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
