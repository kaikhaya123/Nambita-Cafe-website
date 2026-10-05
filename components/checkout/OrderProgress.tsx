// Success page: the "Received -> Preparing -> Ready" bar for a paid order.
// The status comes from useOrderStatus (lib/use-order-status.ts), which keeps it up to date.

import type { OrderStatus } from '@/lib/use-order-status'

const progressSteps = [
  { status: 'new', label: 'Received' },
  { status: 'preparing', label: 'Preparing' },
  { status: 'ready', label: 'Ready for collection' },
] as const

export default function OrderProgress({ status }: Readonly<{ status: OrderStatus }>) {
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
                index === activeIndex ? 'font-bold text-black-900' : 'text-black-900/70'
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
