// Small coloured label showing an order's kitchen stage (New / Preparing / Ready / Collected).

import { fulfillmentLabels, type FulfillmentStatus } from '@/lib/orders'

// Same colours as the kitchen board, so a stage looks the same everywhere.
// Collected is bright green (same as the board's "Collected" button) with black text so it stays readable.
const stageClasses: Record<FulfillmentStatus, string> = {
  new: 'bg-brand-yellow text-black-900',
  preparing: 'bg-black-900 text-white',
  ready: 'bg-brand-green text-white',
  collected: 'bg-green-500 text-black-900',
}

export default function StageBadge({ stage }: Readonly<{ stage: FulfillmentStatus }>) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] ${stageClasses[stage]}`}
    >
      {fulfillmentLabels[stage]}
    </span>
  )
}
