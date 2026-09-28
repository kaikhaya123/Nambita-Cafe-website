// PATCH /api/staff/orders/NC-... — staff only. Moves an order on the kitchen board
// (new -> preparing -> ready -> collected, or back a step). Emails the customer when it becomes "ready".

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isStaffAuthenticated } from '@/lib/staff-auth'
import { fulfillmentStatuses, fulfillmentTimestampColumn,isFulfillmentStatus, staffOrderColumns, type StaffOrder } from '@/lib/orders'
import { sendOrderReadyEmail } from '@/lib/email/order-emails'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  if (!(await isStaffAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orderNumber } = await params
  const body = (await request.json().catch(() => null)) as { status?: unknown } | null
  const status = body?.status

  if (!isFulfillmentStatus(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { data: existing, error: loadError } = await supabase
    .from('orders')
    .select('fulfillment_status, customer_email, customer_first_name, pickup_location_name')
    .eq('order_number', orderNumber)
    .eq('status', 'paid')
    .maybeSingle()

  if (loadError) {
    console.error('Failed to load order for status update', loadError)
    return NextResponse.json({ error: 'Could not update order.' }, { status: 500 })
  }
  if (!existing) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  }

  // Stamp the column for the new stage; clear later stages when moving backwards (undo).
  const update: Record<string, string | null> = { fulfillment_status: status }
  const targetIndex = fulfillmentStatuses.indexOf(status)
  fulfillmentStatuses.forEach((stage, index) => {
    const column = fulfillmentTimestampColumn[stage]
    if (!column) return
    if (index === targetIndex) update[column] = new Date().toISOString()
    else if (index > targetIndex) update[column] = null
  })

  const { data: updated, error: updateError } = await supabase
    .from('orders')
    .update(update)
    .eq('order_number', orderNumber)
    .select(staffOrderColumns)
    .single()

  if (updateError) {
    console.error('Failed to update order fulfillment status', updateError)
    return NextResponse.json({ error: 'Could not update order.' }, { status: 500 })
  }

  if (status === 'ready' && existing.fulfillment_status !== 'ready') {
    await sendOrderReadyEmail({
      order_number: orderNumber,
      customer_first_name: existing.customer_first_name as string,
      customer_email: existing.customer_email as string | null,
      pickup_location_name: existing.pickup_location_name as string,
    })
  }

  return NextResponse.json({ order: updated as StaffOrder })
}
