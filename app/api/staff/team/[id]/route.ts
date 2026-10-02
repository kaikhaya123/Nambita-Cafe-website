// /api/staff/team/:id — managers only.
// PATCH: deactivate or reactivate someone. (Passwords aren't per person: each role shares one,
//   set in STAFF_DASHBOARD_PASSWORD / MANAGER_DASHBOARD_PASSWORD.)

import { NextRequest, NextResponse } from 'next/server'
import { getAccount, summarize, updateAccount } from '@/lib/staff-accounts'
import { getStaffSession } from '@/lib/staff-auth'

type Context = { params: Promise<{ id: string }> }

async function requireManager() {
  const session = await getStaffSession()
  return session?.role === 'manager' ? session : null
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
