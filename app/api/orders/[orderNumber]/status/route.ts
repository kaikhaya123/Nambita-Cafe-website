// GET /api/orders/NC-.../status — public. The success page polls this to show "Preparing" / "Ready".
// Returns no personal details.

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(_request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params

  const { data, error } = await getSupabaseAdmin()
    .from('orders')
    .select('status, fulfillment_status, pickup_location_name')
    .eq('order_number', orderNumber)
    .maybeSingle()

  if (error) {
    console.error('Failed to load order status', error)
    return NextResponse.json({ error: 'Could not load order.' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  }

  return NextResponse.json({
    paymentStatus: data.status,
    fulfillmentStatus: data.fulfillment_status,
    pickupLocationName: data.pickup_location_name,
  })
}
