import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendOrderReceiptEmail, type OrderForReceipt } from '@/lib/email/order-receipt'

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

  const event = JSON.parse(payload) as {
    type?: string
    payload?: { metadata?: { orderNumber?: string } } & Record<string, unknown>
  }

  console.log('Yoco webhook received:', event.type, JSON.stringify(event.payload))

  const orderNumber = event.payload?.metadata?.orderNumber

  let status: 'paid' | 'failed' | null = null
  if (event.type?.includes('succeeded')) status = 'paid'
  else if (event.type?.includes('failed')) status = 'failed'

  if (orderNumber && status) {
    const supabase = getSupabaseAdmin()

    try {
      const { error } = await supabase.from('orders').update({ status }).eq('order_number', orderNumber)
      if (error) throw error
    } catch (error) {
      console.error('Failed to update order status from webhook', error)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    if (status === 'paid') {
      try {
        const { data: order, error } = await supabase
          .from('orders')
          .select(
            'order_number, customer_first_name, customer_last_name, customer_email, pickup_location_name, notes, items, subtotal, total, created_at'
          )
          .eq('order_number', orderNumber)
          .single()

        if (error) throw error
        await sendOrderReceiptEmail(order as OrderForReceipt)
      } catch (error) {
        console.error('Failed to send receipt email from webhook', error)
      }
    }
  }

  return NextResponse.json({ received: true })
}
