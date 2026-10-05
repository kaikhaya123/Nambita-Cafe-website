'use client'

// Checks an order's payment and kitchen status for the success page, by asking
// GET /api/orders/<order number>/status again and again.
// Every 3 seconds while waiting for Yoco to confirm the payment, then every 10 seconds while the kitchen
// makes it. Stops once there's nothing left to wait for, so old open tabs don't keep calling the server.

import { useEffect, useState } from 'react'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export interface OrderStatus {
  paymentStatus: PaymentStatus
  fulfillmentStatus: string
  pickupLocationName: string
}

/** null while the first check is still running, 'not-found' if there's no such order. */
export type OrderStatusResult = OrderStatus | 'not-found' | null

const CHECK_WHILE_PAYING_MS = 3_000
const CHECK_WHILE_PREPARING_MS = 10_000
// Give up after this long (no order takes 4 hours to make).
const STOP_AFTER_MS = 4 * 60 * 60 * 1000

export function useOrderStatus(orderNumber: string | null): OrderStatusResult {
  const [result, setResult] = useState<OrderStatusResult>(null)

  useEffect(() => {
    if (!orderNumber) return
    let cancelled = false
    let timer: number | undefined
    const startedAt = Date.now()

    function checkAgainIn(ms: number) {
      if (!cancelled && Date.now() - startedAt < STOP_AFTER_MS) timer = window.setTimeout(load, ms)
    }

    async function load() {
      // Tab in the background: skip this check (saves the server work) and try again later.
      if (document.hidden) return checkAgainIn(CHECK_WHILE_PREPARING_MS)

      let nextCheck = CHECK_WHILE_PAYING_MS
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber!)}/status`, { cache: 'no-store' })
        if (cancelled) return
        if (response.status === 404) {
          setResult('not-found')
          return
        }
        if (response.ok) {
          const data = (await response.json()) as OrderStatus
          setResult(data)
          // Nothing more will happen to this order: stop checking.
          if (data.paymentStatus === 'failed' || data.paymentStatus === 'cancelled') return
          if (data.fulfillmentStatus === 'collected') return
          if (data.paymentStatus === 'paid') nextCheck = CHECK_WHILE_PREPARING_MS
        }
      } catch {
        // Network blip: just try again on the next check.
      }
      checkAgainIn(nextCheck)
    }

    load()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [orderNumber])

  return orderNumber ? result : 'not-found'
}
