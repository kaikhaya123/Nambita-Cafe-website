// Checks that a Yoco "payment succeeded" message matches the order we saved, before the order is marked paid.
// Used by app/api/webhooks/yoco/route.ts.

/** The parts of Yoco's payment message we use. `amount` is in cents. */
export interface YocoPayment {
  amount?: unknown
  currency?: unknown
  metadata?: { orderNumber?: unknown; checkoutId?: unknown }
}

/**
 * Why the payment doesn't match the order, or null if it matches.
 * Stops an order being marked paid when the amount paid isn't the order total.
 */
export function paymentMismatch(payment: YocoPayment, order: { total: number | string; yoco_checkout_id: string | null }) {
  const expectedCents = Math.round(Number(order.total) * 100)
  if (payment.amount !== expectedCents) return `paid ${String(payment.amount)} cents, order total is ${expectedCents} cents`
  if (payment.currency !== 'ZAR') return `currency is ${String(payment.currency)}, expected ZAR`
  // Yoco's checkout id, if both Yoco and our order have one, must be the checkout we created for this order.
  const checkoutId = payment.metadata?.checkoutId
  if (order.yoco_checkout_id && typeof checkoutId === 'string' && checkoutId !== order.yoco_checkout_id) {
    return `checkout ${checkoutId} is not this order's checkout (${order.yoco_checkout_id})`
  }
  return null
}
