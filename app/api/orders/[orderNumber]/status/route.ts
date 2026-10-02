// GET /api/orders/NC-.../status — public. The success page polls this to show "Preparing" / "Ready".
// Returns no personal details.

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// Order numbers look like NC-2026-0042 (see supabase/orders.sql). Anything else can't exist,
// so it's turned away without asking the database.
const ORDER_NUMBER_PATTERN = /^NC-\d{4}-\d{4,10}$/

export async function GET(_request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params
  if (!ORDER_NUMBER_PATTERN.test(orderNumber)) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('orders')
      .select('status, fulfillment_status, pickup_location_name')
      .eq('order_number', orderNumber)
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    }

    return NextResponse.json({
      paymentStatus: data.status,
      fulfillmentStatus: data.fulfillment_status,
      pickupLocationName: data.pickup_location_name,
    })
  } catch (error) {
    console.error('Failed to load order status', error)
    return NextResponse.json({ error: 'Could not load order.' }, { status: 500 })
  }
}
