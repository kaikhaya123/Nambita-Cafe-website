// POST /api/staff/setup/complete — login setup, step 2 of 2: saves the new password and authenticator,
// then logs the person in.

import { NextRequest, NextResponse } from 'next/server'
import { jsonError } from '@/lib/api-response'
import {
  consumeSetupCode,
  createAccount,
  getAccount,
  getAccountByName,
  hasActiveManager,
  updateAccount,
  type StaffAccount,
} from '@/lib/staff-accounts'
import { createStaffSessionToken, sessionCookieOptions, STAFF_COOKIE_NAME } from '@/lib/staff-auth'
import { hashPassword, passwordProblem } from '@/lib/security/password'
import { verifyTotp } from '@/lib/security/totp'
import { readSetupToken } from '@/lib/staff-setup'

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { setupToken?: unknown; password?: unknown; confirmPassword?: unknown; code?: unknown }
    | null

  const ticket = readSetupToken(body?.setupToken)
  if (!ticket) return jsonError('Setup timed out. Please start again with your setup code.', 400)

  const password = typeof body?.password === 'string' ? body.password : ''
  const confirmPassword = typeof body?.confirmPassword === 'string' ? body.confirmPassword : ''
  const problem = passwordProblem(password, confirmPassword)
  if (problem) return jsonError(problem, 400)

  const step = verifyTotp(ticket.secret, typeof body?.code === 'string' ? body.code : '')
  if (step === null) {
    return jsonError('That authenticator code is not right. Check the app shows "Nambita Cafe" and try the newest code.', 400)
  }

  const credentials = {
    password_hash: await hashPassword(password),
    totp_secret: ticket.secret,
    last_totp_step: step,
    setup_code_hash: null,
    setup_code_expires_at: null,
    failed_attempts: 0,
    locked_until: null,
  }

  let account: StaffAccount | null
  try {
    if (ticket.kind === 'account') {
      account = await getAccount(ticket.accountId)
      if (!account) return jsonError('That setup code is no longer valid. Ask a manager for a new one.', 400)

      // The code must still be the one they started with: not used, replaced or expired since.
      const sessionVersion = account.session_version + 1
      const consumed = await consumeSetupCode(account.id, ticket.codeHash, { ...credentials, session_version: sessionVersion })
      if (!consumed) return jsonError('That setup code is no longer valid. Ask a manager for a new one.', 400)
      account = { ...account, session_version: sessionVersion }
    } else {
      if (await hasActiveManager()) return jsonError('A manager account already exists. Ask a manager for a setup code.', 403)
      const existing = await getAccountByName(ticket.name)
      if (existing) {
        if (existing.role !== 'manager') return jsonError('That name belongs to a staff account.', 400)
        const sessionVersion = existing.session_version + 1
        await updateAccount(existing.id, { ...credentials, is_active: true, session_version: sessionVersion })
        account = { ...existing, session_version: sessionVersion }
      } else {
        account = await createAccount({ name: ticket.name, role: 'manager', ...credentials })
      }
    }
  } catch (error) {
    console.error('Setup completion failed', error)
    return jsonError('Could not finish setup right now. Please try again.', 500)
  }

  const { token, expiresAt } = createStaffSessionToken(account.id, account.session_version)
  const response = NextResponse.json({ ok: true, role: account.role, name: account.name })
  response.cookies.set(STAFF_COOKIE_NAME, token, sessionCookieOptions(expiresAt))
  return response
}
