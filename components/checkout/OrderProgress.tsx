'use client'

// Success page: live "Received -> Preparing -> Ready" bar. Checks the order status every 10 seconds.

import { useEffect, useState } from 'react'

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

    async function load() {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/status`, { cache: 'no-store' })
        if (response.ok && !cancelled) {
          const data = (await response.json()) as { fulfillmentStatus: string; pickupLocationName: string }
          setStatus(data)
          if (data.fulfillmentStatus === 'collected') return
        }
      } catch {}
      if (!cancelled) timer = window.setTimeout(load, 10000)
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
