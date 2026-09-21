import type { OrderLine } from '@/lib/menu-data'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL

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

function lineTotal(line: OrderLine) {
  const addOnsTotal = line.addOns.reduce((sum, addOn) => sum + addOn.price, 0)
  return (line.item.price + addOnsTotal) * line.quantity
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
            .map((addOn) => addOn.name)
            .join(', ')}</div>`
        : ''
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px dashed #d8d3c4;vertical-align:top;">
            <div style="font-size:14px;font-weight:700;color:#161611;">${line.quantity} &times; ${line.item.name}</div>
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
        <div style="font-size:26px;font-weight:700;letter-spacing:0.05em;color:#161611;margin-top:2px;">${order.order_number}</div>
        <div style="font-size:12px;color:#6b6b63;margin-top:6px;">${orderDate}</div>
      </div>

      <div style="font-size:13px;color:#161611;margin-bottom:4px;">
        <strong>${order.customer_first_name} ${order.customer_last_name}</strong>
      </div>
      <div style="font-size:12px;color:#6b6b63;margin-bottom:18px;">
        Pickup at <strong>${order.pickup_location_name}</strong>
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
          ? `<div style="margin-top:16px;font-size:12px;color:#6b6b63;">Notes: ${order.notes}</div>`
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

export async function sendOrderReceiptEmail(order: OrderForReceipt) {
  if (!order.customer_email) {
    console.log(`No email on file for order ${order.order_number}, skipping receipt.`)
    return
  }

  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
    console.error('RESEND_API_KEY / RESEND_FROM_EMAIL not configured — skipping receipt email.')
    return
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: order.customer_email,
        subject: `Your Nambita Cafe order ${order.order_number} is confirmed`,
        html: buildReceiptHtml(order),
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      console.error('Failed to send receipt email', response.status, errorBody)
    }
  } catch (error) {
    console.error('Failed to send receipt email', error)
  }
}
