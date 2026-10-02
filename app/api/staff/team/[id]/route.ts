// /api/staff/team/:id — managers only.
// POST: give a manager a one-time setup code (also resets their existing login).
//   Staff don't get one: they all use the shared staff password (STAFF_DASHBOARD_PASSWORD).
// PATCH: deactivate or reactivate someone.

import { NextRequest, NextResponse } from 'next/server'
import { getAccount, SETUP_CODE_TTL_MS, summarize, updateAccount, usesAuthenticator } from '@/lib/staff-accounts'
import { getStaffSession } from '@/lib/staff-auth'
import { generateSetupCode, hashSetupCode } from '@/lib/security/tokens'

type Context = { params: Promise<{ id: string }> }

async function requireManager() {
  const session = await getStaffSession()
  return session?.role === 'manager' ? session : null
}

// Manager only: one-time setup code for a manager. For someone already set up this is a reset:
// their old login stops working and they're logged out everywhere.
export async function POST(_request: NextRequest, { params }: Context) {
  const session = await requireManager()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (id === session.accountId) {
    return NextResponse.json({ error: 'You can’t reset your own account. Ask another manager.' }, { status: 400 })
  }

  try {
    const account = await getAccount(id)
    if (!account) return NextResponse.json({ error: 'Team member not found.' }, { status: 404 })

    if (!usesAuthenticator(account.role)) {
      return NextResponse.json(
        { error: 'Staff use the shared staff password. To change it, update STAFF_DASHBOARD_PASSWORD and redeploy.' },
        { status: 400 }
      )
    }

    const code = generateSetupCode()
    const expiresAt = new Date(Date.now() + SETUP_CODE_TTL_MS).toISOString()
    const fields = {
      setup_code_hash: hashSetupCode(code),
      setup_code_expires_at: expiresAt,
      password_hash: null,
      totp_secret: null,
      last_totp_step: null,
      failed_attempts: 0,
      locked_until: null,
      session_version: account.session_version + 1,
    }
    await updateAccount(id, fields)

    // The plain code is only ever returned here, once.
    return NextResponse.json({ code, account: summarize({ ...account, ...fields }) })
  } catch (error) {
    console.error('Failed to issue setup code', error)
    return NextResponse.json({ error: 'Could not create a setup code.' }, { status: 500 })
  }
}

// Manager only: deactivate or reactivate someone. Deactivating logs them out everywhere.
export async function PATCH(request: NextRequest, { params }: Context) {
  const session = await requireManager()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = (await request.json().catch(() => null)) as { isActive?: unknown } | null
  if (typeof body?.isActive !== 'boolean') return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  if (id === session.accountId && !body.isActive) {
    return NextResponse.json({ error: 'You can’t deactivate your own account.' }, { status: 400 })
  }

  try {
    const account = await getAccount(id)
    if (!account) return NextResponse.json({ error: 'Team member not found.' }, { status: 404 })

    const fields = {
      is_active: body.isActive,
      session_version: body.isActive ? account.session_version : account.session_version + 1,
    }
    await updateAccount(id, fields)
    return NextResponse.json({ account: summarize({ ...account, ...fields }) })
  } catch (error) {
    console.error('Failed to update team member', error)
    return NextResponse.json({ error: 'Could not update team member.' }, { status: 500 })
  }
}
