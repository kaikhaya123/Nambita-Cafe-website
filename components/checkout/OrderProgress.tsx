'use client'

// Success page: live "Received -> Preparing -> Ready" bar. Checks the order status every 10 seconds.
// Stops checking once there's nothing left to wait for, so old open tabs don't keep calling the server.

import { useEffect, useState } from 'react'

const CHECK_EVERY_MS = 10_000
// Give up after this long (no order takes 4 hours to make).
const STOP_AFTER_MS = 4 * 60 * 60 * 1000
// Payment results that will never turn into an order on the kitchen board.
const finalPaymentStatuses = ['failed', 'cancelled']

const progressSteps = [
  { status: 'new', label: 'Received' },
  { status: 'preparing', label: 'Preparing' },
  { status: 'ready', label: 'Ready for collection' },
] as const

export default function OrderProgress({ orderNumber }: { orderNumber: string }) {
  const [status, setStatus] = useState<{ fulfillmentStatus: string; pickupLocationName: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    let timer: number | undefined
    const startedAt = Date.now()

    function checkAgainLater() {
      if (!cancelled && Date.now() - startedAt < STOP_AFTER_MS) timer = window.setTimeout(load, CHECK_EVERY_MS)
    }

    async function load() {
      // Tab in the background: skip this check (saves the server work) and try again later.
      if (document.hidden) return checkAgainLater()
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/status`, { cache: 'no-store' })
        if (cancelled) return
        // No such order: it will never appear, so stop.
        if (response.status === 404) return
        if (response.ok) {
          const data = (await response.json()) as {
            paymentStatus: string
            fulfillmentStatus: string
            pickupLocationName: string
          }
          // Payment failed: nothing to show or wait for.
          if (finalPaymentStatuses.includes(data.paymentStatus)) return
          setStatus(data)
          if (data.fulfillmentStatus === 'collected') return
        }
      } catch {
        // Network blip: just try again on the next check.
      }
      checkAgainLater()
    }

    load()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [orderNumber])

  if (!status) return null

  if (status.fulfillmentStatus === 'collected') {
    return <p className="font-dm-sans text-sm font-bold text-black-900">Collected — enjoy your meal!</p>
  }

  const activeIndex = progressSteps.findIndex((step) => step.status === status.fulfillmentStatus)
  const isReady = status.fulfillmentStatus === 'ready'

  return (
    <div className="mt-2 w-full max-w-md" aria-live="polite">
      <ol className="flex items-center gap-2">
        {progressSteps.map((step, index) => (
          <li key={step.status} className="flex flex-1 flex-col items-center gap-2">
            <span
              className={`h-2 w-full rounded-full ${
                index <= activeIndex ? (isReady ? 'bg-brand-green' : 'bg-black-900') : 'bg-black-900/15'
              }`}
            />
            <span
              className={`font-dm-sans text-[11px] uppercase tracking-[0.08em] ${
                index === activeIndex ? 'font-bold text-black-900' : 'text-black-900/50'
              }`}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>
      {isReady && (
        <p className="mt-4 rounded-xl bg-brand-green px-4 py-3 font-dm-sans text-sm font-bold text-white">
          Your order is ready! Collect it at {status.pickupLocationName}.
        </p>
      )}
    </div>
  )
}
