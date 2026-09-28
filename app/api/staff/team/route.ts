import { NextRequest, NextResponse } from 'next/server'
import { cleanStaffName, createAccount, getAccountByName, isStaffRole, summarize } from '@/lib/staff-accounts'
import { getStaffSession } from '@/lib/staff-auth'

// Manager only: add a team member. They can't log in until given a setup code.
export async function POST(request: NextRequest) {
  const session = await getStaffSession()
  if (session?.role !== 'manager') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => null)) as { name?: unknown; role?: unknown } | null
  const name = cleanStaffName(body?.name)
  if (!name) return NextResponse.json({ error: 'Please enter a name.' }, { status: 400 })
  if (!isStaffRole(body?.role)) return NextResponse.json({ error: 'Please choose Staff or Manager.' }, { status: 400 })

  try {
    if (await getAccountByName(name)) {
      return NextResponse.json({ error: 'Someone with that name already exists.' }, { status: 409 })
    }
    const account = await createAccount({ name, role: body.role })
    return NextResponse.json({ account: summarize(account) })
  } catch (error) {
    console.error('Failed to create team member', error)
    return NextResponse.json({ error: 'Could not add team member.' }, { status: 500 })
  }
}
