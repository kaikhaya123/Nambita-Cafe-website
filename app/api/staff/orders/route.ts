import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isStaffAuthenticated } from '@/lib/staff-auth'
import { staffOrderColumns, type StaffOrder } from '@/lib/orders'

// Collected orders stay visible on the board for this long (for undo / "where's my order?").
const COLLECTED_WINDOW_MS = 3 * 60 * 60 * 1000

export async function GET() {
  if (!(await isStaffAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const collectedSince = new Date(Date.now() - COLLECTED_WINDOW_MS).toISOString()

  const [active, collected] = await Promise.all([
    supabase
      .from('orders')
      .select(staffOrderColumns)
      .eq('status', 'paid')
      .in('fulfillment_status', ['new', 'preparing', 'ready'])
      .order('created_at', { ascending: true })
      .limit(200),
    supabase
      .from('orders')
      .select(staffOrderColumns)
      .eq('status', 'paid')
      .eq('fulfillment_status', 'collected')
      .gte('collected_at', collectedSince)
      .order('collected_at', { ascending: false })
      .limit(50),
  ])

  const error = active.error ?? collected.error
  if (error) {
    console.error('Failed to load staff orders', error)
    return NextResponse.json({ error: 'Could not load orders.' }, { status: 500 })
  }

  const orders = [...(active.data ?? []), ...(collected.data ?? [])] as StaffOrder[]
  return NextResponse.json({ orders, serverTime: new Date().toISOString() })
}
