// POST /api/webhooks/yoco — Yoco calls this (not the browser) after a payment succeeds or fails.
// We check Yoco's signature so nobody can fake a "paid" message, check the amount paid matches the order
// total, update the order, and email the receipt. Only the exact event types below change an order:
// "payment.succeeded" (paid) and "payment.failed" (failed). Refund events are logged, not recorded.

import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendOrderReceiptEmail, type OrderForReceipt } from '@/lib/email/order-emails'
import { paymentMismatch, type YocoPayment } from '@/lib/yoco-payment'

const YOCO_WEBHOOK_SECRET = process.env.YOCO_WEBHOOK_SECRET

// Yoco signs webhooks the same way Svix does: https://docs.yoco.com/webhooks
const TOLERANCE_SECONDS = 5 * 60

function isValidSignature(payload: string, headers: { id: string; timestamp: string; signature: string }, secret: string) {
  const timestampSeconds = Number(headers.timestamp)
  if (!Number.isFinite(timestampSeconds)) return false
  if (Math.abs(Date.now() / 1000 - timestampSeconds) > TOLERANCE_SECONDS) return false

  const secretBytes = Buffer.from(secret.split('_')[1] ?? secret, 'base64')
  const signedContent = `${headers.id}.${headers.timestamp}.${payload}`
  const expected = createHmac('sha256', secretBytes).update(signedContent).digest('base64')

  return headers.signature
    .split(' ')
    .map((part) => part.split(',')[1])
    .filter(Boolean)
    .some((candidate) => {
      const candidateBuf = Buffer.from(candidate, 'base64')
      const expectedBuf = Buffer.from(expected, 'base64')
      return candidateBuf.length === expectedBuf.length && timingSafeEqual(candidateBuf, expectedBuf)
    })
}

export async function POST(request: NextRequest) {
  if (!YOCO_WEBHOOK_SECRET) {
    console.error('YOCO_WEBHOOK_SECRET is not configured — rejecting webhook.')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const payload = await request.text()
  const id = request.headers.get('webhook-id')
  const timestamp = request.headers.get('webhook-timestamp')
  const signature = request.headers.get('webhook-signature')

  if (!id || !timestamp || !signature) {
    return NextResponse.json({ error: 'Missing signature headers' }, { status: 400 })
  }

  const valid = isValidSignature(payload, { id, timestamp, signature }, YOCO_WEBHOOK_SECRET)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: { type?: unknown; payload?: YocoPayment }
  try {
    event = JSON.parse(payload)
  } catch {
    console.error('Yoco webhook body is not valid JSON')
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const type = typeof event.type === 'string' ? event.type : '(no type)'
  const rawOrderNumber = event.payload?.metadata?.orderNumber
  const orderNumber = typeof rawOrderNumber === 'string' ? rawOrderNumber : null

  // Log only what's needed to trace an order; the payload holds customer details.
  console.log('Yoco webhook received:', type, orderNumber ?? '(no order number)')

  if (!orderNumber) return NextResponse.json({ received: true })

  if (type === 'payment.succeeded') return markPaid(orderNumber, event.payload ?? {})

  if (type === 'payment.failed') {
    // Only changes a pending order, so a late "failed" can never undo a payment.
    const { error } = await getSupabaseAdmin()
      .from('orders')
      .update({ status: 'failed' })
      .eq('order_number', orderNumber)
      .eq('status', 'pending')
    if (error) {
      console.error('Failed to mark order as failed from webhook', error)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }
    return NextResponse.json({ received: true })
  }

  if (type.startsWith('refund.')) {
    // Refunds aren't recorded on the order yet, so sales reports still count it. Logged so it can be found.
    console.warn(`Yoco refund event "${type}" for order ${orderNumber}: not recorded automatically, check the sales figures.`)
  }

  // Any other event type is ignored on purpose.
  return NextResponse.json({ received: true })
}

const RECEIPT_COLUMNS =
  'order_number, status, yoco_checkout_id, customer_first_name, customer_last_name, customer_email, pickup_location_name, notes, items, subtotal, total, created_at'

/**
 * Marks an order paid and emails the receipt, after checking the payment matches the order.
 * The update only changes a row that isn't paid yet, so retries from Yoco send the receipt once.
 * If the database can't be reached we answer 500, and Yoco tries again later.
 */
async function markPaid(orderNumber: string, payment: YocoPayment) {
  const supabase = getSupabaseAdmin()

  const { data: order, error: loadError } = await supabase
    .from('orders')
    .select(RECEIPT_COLUMNS)
    .eq('order_number', orderNumber)
    .maybeSingle()
  if (loadError) {
    console.error('Failed to load order for webhook', loadError)
    return NextResponse.json({ error: 'Failed to load order' }, { status: 500 })
  }
  if (!order) {
    console.error(`Yoco says order ${orderNumber} was paid, but there is no such order`)
    return NextResponse.json({ received: true })
  }

  const mismatch = paymentMismatch(payment, order)
  if (mismatch) {
    // Answered with 200 because Yoco sending it again won't change the amount. Needs a person to look at it.
    console.error(`NOT marking order ${orderNumber} as paid: ${mismatch}. Check this payment in the Yoco dashboard.`)
    return NextResponse.json({ received: true })
  }

  const { data: changedRows, error: updateError } = await supabase
    .from('orders')
    .update({ status: 'paid' })
    .eq('order_number', orderNumber)
    .neq('status', 'paid')
    .select('order_number')
  if (updateError) {
    console.error('Failed to mark order as paid from webhook', updateError)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }

  if ((changedRows ?? []).length > 0) {
    await sendOrderReceiptEmail(order as unknown as OrderForReceipt)
  }
  return NextResponse.json({ received: true })
}
