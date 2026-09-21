import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { cafeLocationsById } from '@/lib/cafe-locations'
import type { OrderLine } from '@/lib/menu-data'

const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY

interface CheckoutRequestBody {
  amount: number
  subtotal: number
  items: OrderLine[]
  customer: {
    firstName: string
    lastName: string
    phone: string
    email: string
    pickupLocationId: string
    notes: string
  }
}

export async function POST(request: NextRequest) {
  if (!YOCO_SECRET_KEY) {
    return NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 500 })
  }

  const body = (await request.json().catch(() => null)) as CheckoutRequestBody | null

  if (
    !body ||
    !Number.isFinite(body.amount) ||
    body.amount <= 0 ||
    !Array.isArray(body.items) ||
    body.items.length === 0 ||
    !body.customer
  ) {
    return NextResponse.json({ error: 'Invalid checkout request.' }, { status: 400 })
  }

  const { amount, subtotal, items, customer } = body

  const pickupLocation = cafeLocationsById[customer.pickupLocationId]
  if (!pickupLocation) {
    return NextResponse.json({ error: 'Please choose a valid pickup location.' }, { status: 400 })
  }

  const origin = request.nextUrl.origin
  const amountInCents = Math.round(amount * 100)

  const supabase = getSupabaseAdmin()

  let orderNumber: string
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        status: 'pending',
        customer_first_name: customer.firstName,
        customer_last_name: customer.lastName,
        customer_phone: customer.phone,
        customer_email: customer.email || null,
        pickup_location_id: pickupLocation.id,
        pickup_location_name: pickupLocation.name,
        notes: customer.notes || null,
        items,
        subtotal,
        total: amount,
      })
      .select('order_number')
      .single()

    if (error) throw error
    orderNumber = data.order_number as string
  } catch (error) {
    console.error('Failed to save order to Supabase', error)
    return NextResponse.json({ error: 'Could not save your order right now. Please try again.' }, { status: 500 })
  }

  const yocoResponse = await fetch('https://payments.yoco.com/api/checkouts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${YOCO_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountInCents,
      currency: 'ZAR',
      cancelUrl: `${origin}/checkout?payment=cancelled`,
      failureUrl: `${origin}/checkout?payment=failed`,
      successUrl: `${origin}/checkout/success?order=${encodeURIComponent(orderNumber)}`,
      metadata: {
        orderNumber,
        customerName: `${customer.firstName} ${customer.lastName}`.trim(),
        customerPhone: customer.phone,
        customerEmail: customer.email,
        pickupLocationId: pickupLocation.id,
      },
    }),
  })

  if (!yocoResponse.ok) {
    const errorBody = await yocoResponse.text().catch(() => '')
    console.error('Yoco checkout creation failed', yocoResponse.status, errorBody)
    return NextResponse.json({ error: 'Could not start payment right now. Please try again.' }, { status: 502 })
  }

  const yocoData = (await yocoResponse.json()) as { redirectUrl?: string; id?: string }

  if (!yocoData.redirectUrl) {
    return NextResponse.json({ error: 'Could not start payment right now. Please try again.' }, { status: 502 })
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ yoco_checkout_id: yocoData.id ?? null })
    .eq('order_number', orderNumber)

  if (updateError) {
    console.error('Failed to attach Yoco checkout id to order', updateError)
  }

  return NextResponse.json({ redirectUrl: yocoData.redirectUrl, checkoutId: yocoData.id })
}
