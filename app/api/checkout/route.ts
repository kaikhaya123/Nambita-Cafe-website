// POST /api/checkout — called by the checkout page when the customer clicks "Pay".
// 0. Stops one visitor from starting too many checkouts in a short time (rate limit).
// 1. Rebuilds the order from the menu (never trusts prices sent by the browser).
// 2. Saves it in Supabase as "pending".
// 3. Asks Yoco for a payment page and returns its URL so the browser can go there.
//    If Yoco can't make one, the order is marked "failed" so it isn't left hanging.
// Yoco later calls app/api/webhooks/yoco to say whether the payment worked.

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { cafeLocationsById } from '@/lib/cafe-locations'
import { lineTotal, parseOrderLine, type OrderLine } from '@/lib/menu-data'
import { clientAddressKey, isWithinRateLimit } from '@/lib/rate-limit'

const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY

const MAX_LINES = 30

// Rate limits. A real customer rarely needs more than 2–3 tries (e.g. after a declined card).
const CHECKOUTS_PER_ADDRESS = 10 // per visitor's internet address...
const CHECKOUTS_PER_PHONE = 5 // ...and per phone number...
const RATE_WINDOW_SECONDS = 10 * 60 // ...in 10 minutes.

// Give up on Yoco after this long, instead of keeping the customer waiting.
const YOCO_TIMEOUT_MS = 15_000

const PAYMENT_UNAVAILABLE = 'Could not start payment right now. Please try again.'

/** Asks Yoco for a payment page. Returns null (and logs why) if it doesn't work. */
async function createYocoCheckout(body: object) {
  try {
    const response = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(YOCO_TIMEOUT_MS),
    })
    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      console.error('Yoco checkout creation failed', response.status, errorBody)
      return null
    }
    const data = (await response.json()) as { redirectUrl?: unknown; id?: unknown }
    if (typeof data.redirectUrl !== 'string' || !data.redirectUrl) {
      console.error('Yoco checkout response had no redirectUrl')
      return null
    }
    return { redirectUrl: data.redirectUrl, id: typeof data.id === 'string' ? data.id : null }
  } catch (error) {
    // Network error, or Yoco took longer than YOCO_TIMEOUT_MS.
    console.error('Could not reach Yoco to create a checkout', error)
    return null
  }
}

// Trimmed string no longer than `max`, or '' if missing or not a string.
function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 })
}

export async function POST(request: NextRequest) {
  if (!YOCO_SECRET_KEY) {
    return NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 500 })
  }

  const body = (await request.json().catch(() => null)) as { items?: unknown; customer?: Record<string, unknown> } | null
  if (!body || !Array.isArray(body.items) || body.items.length === 0 || !body.customer) {
    return badRequest('Invalid checkout request.')
  }
  if (body.items.length > MAX_LINES) {
    return badRequest(`Orders are limited to ${MAX_LINES} lines. Please split your order.`)
  }

  // Never trust names or prices from the browser: rebuild every line from the menu.
  const items = body.items.map(parseOrderLine)
  if (items.some((line) => line === null)) {
    return badRequest('Your order has an item that is no longer on the menu. Please update your order and try again.')
  }
  const lines = items as OrderLine[]
  const subtotalInCents = lines.reduce((sum, line) => sum + Math.round(lineTotal(line) * 100), 0)
  const amountInCents = subtotalInCents
  const subtotal = subtotalInCents / 100
  const amount = amountInCents / 100

  const customer = {
    firstName: text(body.customer.firstName, 50),
    lastName: text(body.customer.lastName, 50),
    phone: text(body.customer.phone, 20),
    email: text(body.customer.email, 254),
    pickupLocationId: text(body.customer.pickupLocationId, 50),
    notes: text(body.customer.notes, 300),
  }
  if (!customer.firstName || !customer.lastName) return badRequest('Please enter your name and surname.')
  const phoneDigits = customer.phone.replace(/\D/g, '')
  if (!/^\+?[\d\s()-]{7,20}$/.test(customer.phone) || phoneDigits.length < 7) {
    return badRequest('Please enter a valid contact number.')
  }
  if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    return badRequest('Please enter a valid email address, or leave it blank.')
  }

  const pickupLocation = Object.hasOwn(cafeLocationsById, customer.pickupLocationId)
    ? cafeLocationsById[customer.pickupLocationId]
    : undefined
  if (!pickupLocation) {
    return badRequest('Please choose a valid pickup location.')
  }

  // Checked after the form is valid, so a typo doesn't use up one of the customer's tries.
  const [addressOk, phoneOk] = await Promise.all([
    isWithinRateLimit(`checkout:ip:${clientAddressKey(request)}`, CHECKOUTS_PER_ADDRESS, RATE_WINDOW_SECONDS),
    isWithinRateLimit(`checkout:phone:${phoneDigits}`, CHECKOUTS_PER_PHONE, RATE_WINDOW_SECONDS),
  ])
  if (!addressOk || !phoneOk) {
    return NextResponse.json(
      { error: 'Too many payment attempts. Please wait 10 minutes and try again, or order at the counter.' },
      { status: 429 }
    )
  }

  const origin = request.nextUrl.origin

  let supabase: ReturnType<typeof getSupabaseAdmin>
  let orderNumber: string
  try {
    supabase = getSupabaseAdmin()
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
        items: lines,
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

  const yoco = await createYocoCheckout({
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
  })

  if (!yoco) {
    // No payment page means this order can never be paid: mark it "failed" so it isn't left as "pending".
    const { error } = await supabase.from('orders').update({ status: 'failed' }).eq('order_number', orderNumber)
    if (error) console.error('Failed to mark order as failed after Yoco error', orderNumber, error)
    return NextResponse.json({ error: PAYMENT_UNAVAILABLE }, { status: 502 })
  }

  // Not critical: the webhook finds the order by its number, not this id. It's kept for tracing payments.
  const { error: updateError } = await supabase
    .from('orders')
    .update({ yoco_checkout_id: yoco.id })
    .eq('order_number', orderNumber)
  if (updateError) {
    console.error('Failed to attach Yoco checkout id to order', orderNumber, updateError)
  }

  return NextResponse.json({ redirectUrl: yoco.redirectUrl, checkoutId: yoco.id })
}
