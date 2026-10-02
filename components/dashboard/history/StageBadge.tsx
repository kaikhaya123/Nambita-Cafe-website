// Small coloured label showing an order's kitchen stage (New / Preparing / Ready / Collected).

import { fulfillmentLabels, type FulfillmentStatus } from '@/lib/orders'

// Same colours as the kitchen board columns, so a stage looks the same everywhere.
const stageClasses: Record<FulfillmentStatus, string> = {
  new: 'bg-brand-yellow text-black-900',
  preparing: 'bg-black-900 text-white',
  ready: 'bg-brand-green text-white',
  collected: 'bg-black-900/10 text-black-900/70',
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
