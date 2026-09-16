import { randomInt } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { OrderLine } from '@/lib/menu-data'

const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY

interface CheckoutRequestBody {
  amount: number
  subtotal: number
  deliveryFee: number
  items: OrderLine[]
  customer: {
    firstName: string
    lastName: string
    phone: string
    email: string
    address: string
    notes: string
  }
}

function generateOrderNumber() {
  return `NC-${randomInt(100000, 1000000)}`
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

  const { amount, subtotal, deliveryFee, items, customer } = body
  const orderNumber = generateOrderNumber()
  const origin = request.nextUrl.origin
  const amountInCents = Math.round(amount * 100)

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
        deliveryAddress: customer.address,
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

  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('orders').insert({
      order_number: orderNumber,
      status: 'pending',
      customer_first_name: customer.firstName,
      customer_last_name: customer.lastName,
      customer_phone: customer.phone,
      customer_email: customer.email || null,
      delivery_address: customer.address,
      notes: customer.notes || null,
      items,
      subtotal,
      delivery_fee: deliveryFee,
      total: amount,
      yoco_checkout_id: yocoData.id ?? null,
    })

    if (error) throw error
  } catch (error) {
    console.error('Failed to save order to Supabase', error)
    return NextResponse.json({ error: 'Could not save your order right now. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ redirectUrl: yocoData.redirectUrl, checkoutId: yocoData.id })
}
