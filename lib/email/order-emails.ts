// Server-only. Builds and sends customer emails through Resend:
// - the receipt (after payment)
// - the "your order is ready" notice (when staff mark it ready)

import { lineTotal, type OrderLine } from '@/lib/menu-data'
import { ticketNumber } from '@/lib/orders'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL
const EMAIL_TIMEOUT_MS = 10_000

export interface OrderForReceipt {
  order_number: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string | null
  pickup_location_name: string
  notes: string | null
  items: OrderLine[]
  subtotal: number
  total: number
  created_at: string
}

// Customer-entered text must never be read as HTML in the email.
function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildReceiptHtml(order: OrderForReceipt) {
  const orderDate = new Date(order.created_at).toLocaleString('en-ZA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const itemRows = order.items
    .map((line) => {
      const addOnsLine = line.addOns.length
        ? `<div style="font-size:12px;color:#6b6b63;margin-top:2px;">+ ${line.addOns
            .map((addOn) => escapeHtml(addOn.name))
            .join(', ')}</div>`
        : ''
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px dashed #d8d3c4;vertical-align:top;">
            <div style="font-size:14px;font-weight:700;color:#161611;">${escapeHtml(line.quantity)} &times; ${escapeHtml(line.item.name)}</div>
            ${addOnsLine}
          </td>
          <td style="padding:10px 0;border-bottom:1px dashed #d8d3c4;text-align:right;font-size:14px;font-weight:700;color:#161611;vertical-align:top;white-space:nowrap;">
            R${lineTotal(line).toFixed(2)}
          </td>
        </tr>
      `
    })
    .join('')

  return `
  <div style="background:#efeadb;padding:32px 16px;font-family:'Courier New',Courier,monospace;">
    <div style="max-width:420px;margin:0 auto;background:#faf8f3;border:1px solid #16161122;border-radius:4px;padding:28px 24px;">
      <div style="text-align:center;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#6b6b63;">Nambita Cafe</div>
        <div style="font-size:12px;letter-spacing:0.1em;color:#6b6b63;margin-top:4px;">Order Receipt</div>
      </div>

      <div style="border-top:1px dashed #d8d3c4;border-bottom:1px dashed #d8d3c4;margin:18px 0;padding:16px 0;text-align:center;">
        <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#6b6b63;">Order Number</div>
        <div style="font-size:40px;font-weight:700;letter-spacing:0.05em;color:#161611;margin-top:2px;">${escapeHtml(ticketNumber(order.order_number))}</div>
        <div style="font-size:12px;color:#6b6b63;margin-top:6px;">${escapeHtml(orderDate)}</div>
        <div style="font-size:11px;color:#6b6b63;margin-top:2px;">Ref ${escapeHtml(order.order_number)}</div>
      </div>

      <div style="font-size:13px;color:#161611;margin-bottom:4px;">
        <strong>${escapeHtml(order.customer_first_name)} ${escapeHtml(order.customer_last_name)}</strong>
      </div>
      <div style="font-size:12px;color:#6b6b63;margin-bottom:18px;">
        Pickup at <strong>${escapeHtml(order.pickup_location_name)}</strong>
      </div>

      <table style="width:100%;border-collapse:collapse;">
        ${itemRows}
      </table>

      <div style="margin-top:14px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#6b6b63;padding:2px 0;">
          <span>Subtotal</span>
          <span>R${order.subtotal.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;color:#161611;border-top:1px dashed #d8d3c4;margin-top:8px;padding-top:8px;">
          <span>Total Paid</span>
          <span>R${order.total.toFixed(2)}</span>
        </div>
      </div>

      ${
        order.notes
          ? `<div style="margin-top:16px;font-size:12px;color:#6b6b63;">Notes: ${escapeHtml(order.notes)}</div>`
          : ''
      }

      <div style="margin-top:24px;padding-top:18px;border-top:1px dashed #d8d3c4;text-align:center;">
        <div style="font-size:13px;font-weight:700;color:#161611;">Come collect your order!</div>
        <div style="font-size:12px;color:#6b6b63;margin-top:4px;">
          Show this order number at the counter when you arrive.
        </div>
      </div>
    </div>
  </div>
  `
}

async function sendEmail(kind: string, to: string, subject: string, html: string) {
  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
    console.error(`RESEND_API_KEY / RESEND_FROM_EMAIL not configured — skipping ${kind} email.`)
    return
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: RESEND_FROM_EMAIL, to, subject, html }),
      // Don't let a slow email service hold up the kitchen board or Yoco's webhook.
      signal: AbortSignal.timeout(EMAIL_TIMEOUT_MS),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      console.error(`Failed to send ${kind} email`, response.status, errorBody)
    }
  } catch (error) {
    console.error(`Failed to send ${kind} email`, error)
  }
}

export async function sendOrderReceiptEmail(order: OrderForReceipt) {
  if (!order.customer_email) {
    console.log(`No email on file for order ${order.order_number}, skipping receipt.`)
    return
  }

  await sendEmail(
    'receipt',
    order.customer_email,
    `Nambita Cafe: Order No. ${ticketNumber(order.order_number)} is confirmed`,
    buildReceiptHtml(order)
  )
}

export interface OrderForReadyNotice {
  order_number: string
  customer_first_name: string
  customer_email: string | null
  pickup_location_name: string
}

function buildReadyHtml(order: OrderForReadyNotice) {
  return `
  <div style="background:#efeadb;padding:32px 16px;font-family:'Courier New',Courier,monospace;">
    <div style="max-width:420px;margin:0 auto;background:#faf8f3;border:1px solid #16161122;border-radius:4px;padding:28px 24px;text-align:center;">
      <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#6b6b63;">Nambita Cafe</div>
      <div style="font-size:20px;font-weight:700;color:#161611;margin-top:14px;">Your order is ready, ${escapeHtml(order.customer_first_name)}!</div>

      <div style="border-top:1px dashed #d8d3c4;border-bottom:1px dashed #d8d3c4;margin:18px 0;padding:16px 0;">
        <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#6b6b63;">Order Number</div>
        <div style="font-size:40px;font-weight:700;letter-spacing:0.05em;color:#161611;margin-top:2px;">${escapeHtml(ticketNumber(order.order_number))}</div>
      </div>

      <div style="font-size:13px;color:#161611;">
        Collect it at the counter at <strong>${escapeHtml(order.pickup_location_name)}</strong>.
      </div>
      <div style="font-size:12px;color:#6b6b63;margin-top:6px;">
        Show this order number when you arrive.
      </div>
    </div>
  </div>
  `
}

export async function sendOrderReadyEmail(order: OrderForReadyNotice) {
  if (!order.customer_email) return

  await sendEmail(
    'ready-for-collection',
    order.customer_email,
    `Order No. ${ticketNumber(order.order_number)} is ready for collection`,
    buildReadyHtml(order)
  )
}
