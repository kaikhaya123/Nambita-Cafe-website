// POST /api/staff/setup/start — login setup, step 1 of 2: checks the setup code (or the first-manager
// password) and returns a QR code for the person's authenticator app.

import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { jsonError, slowDown } from '@/lib/api-response'
import {
  cleanStaffName,
  getAccount,
  getAccountByName,
  hasActiveManager,
  isLocked,
  recordFailedAttempt,
} from '@/lib/staff-accounts'
import { hashSetupCode, safeEqual, secretsMatch } from '@/lib/security/tokens'
import { generateTotpSecret, totpUri } from '@/lib/security/totp'
import { createSetupToken, formatManualKey, type SetupTicket } from '@/lib/staff-setup'

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { accountId?: unknown; setupCode?: unknown; firstManager?: unknown; name?: unknown; managerPassword?: unknown }
    | null

  const secret = generateTotpSecret()
  let ticket: SetupTicket
  let accountName: string

  try {
    if (body?.firstManager === true) {
      const bootstrapPassword = process.env.MANAGER_DASHBOARD_PASSWORD
      if (!bootstrapPassword) return jsonError('First-manager setup is not configured (MANAGER_DASHBOARD_PASSWORD missing).', 500)
      if (await hasActiveManager()) return jsonError('A manager account already exists. Ask a manager for a setup code.', 403)

      const name = cleanStaffName(body.name)
      if (!name) return jsonError('Please enter your name.', 400)
      const existing = await getAccountByName(name)
      if (existing && existing.role !== 'manager') return jsonError('That name belongs to a staff account.', 400)

      const candidate = typeof body.managerPassword === 'string' ? body.managerPassword : ''
      if (!secretsMatch(candidate, bootstrapPassword)) {
        await slowDown()
        return jsonError('Incorrect manager password.', 401)
      }

      ticket = { kind: 'first-manager', name, secret }
      accountName = name
    } else {
      const account = await getAccount(typeof body?.accountId === 'string' ? body.accountId : '')
      if (!account || !account.is_active) return jsonError('Please choose your name from the list.', 400)
      if (isLocked(account)) return jsonError('Too many attempts. Try again in 15 minutes.', 429)

      const codeValid =
        account.setup_code_hash &&
        account.setup_code_expires_at &&
        new Date(account.setup_code_expires_at).getTime() > Date.now() &&
        safeEqual(account.setup_code_hash, hashSetupCode(typeof body?.setupCode === 'string' ? body.setupCode : ''))

      if (!codeValid) {
        await recordFailedAttempt(account)
        await slowDown()
        return jsonError('That setup code is wrong or has expired. Ask a manager for a new one.', 401)
      }

      ticket = { kind: 'account', accountId: account.id, secret, codeHash: account.setup_code_hash! }
      accountName = account.name
    }
  } catch (error) {
    console.error('Setup start failed', error)
    return jsonError('Could not start setup right now. Please try again.', 500)
  }

  const qrDataUrl = await QRCode.toDataURL(totpUri(secret, accountName), { margin: 1, width: 240 })

  return NextResponse.json({
    setupToken: createSetupToken(ticket),
    accountName,
    qrDataUrl,
    manualKey: formatManualKey(secret),
  })
}
