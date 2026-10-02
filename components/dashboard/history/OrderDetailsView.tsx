// Order details page body: the order number, customer, what they ordered, the note, what they paid,
// and a timeline of when it was placed, prepared, made ready and collected.

import Link from 'next/link'
import StageBadge from '@/components/dashboard/history/StageBadge'
import { formatDateTime, formatRand } from '@/lib/format'
import { lineTotal } from '@/lib/menu-data'
import { ticketNumber } from '@/lib/orders'
import type { OrderDetails } from '@/lib/order-history'

const paymentLabels: Record<OrderDetails['status'], { label: string; tone: string }> = {
  paid: { label: 'Paid', tone: 'bg-brand-green text-white' },
  pending: { label: 'Not paid yet', tone: 'bg-amber-200 text-amber-900' },
  failed: { label: 'Payment failed', tone: 'bg-red-600 text-white' },
  cancelled: { label: 'Cancelled', tone: 'bg-black-900/10 text-black-900/70' },
}

function Section({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="rounded-2xl border border-black-900/10 bg-white p-5 sm:p-6">
      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-black-900/50">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

export default function OrderDetailsView({ order }: Readonly<{ order: OrderDetails }>) {
  const payment = paymentLabels[order.status]
  const timeline = [
    { label: 'Placed', at: order.created_at },
    { label: 'Started preparing', at: order.preparing_at },
    { label: 'Ready for collection', at: order.ready_at },
    { label: 'Collected', at: order.collected_at },
  ]

  return (
    <div className="space-y-5">
      <Link href="/dashboard/history" className="inline-block text-xs font-bold uppercase tracking-[0.08em] underline underline-offset-4">
        ← Order history
      </Link>

      {/* Order number and where it's at */}
      <div className="text-center">
        <h1 className="font-teko text-5xl uppercase leading-none tracking-[0.04em]">Order No. {ticketNumber(order.order_number)}</h1>
        <p className="mt-1 text-xs text-black-900/50">Ref {order.order_number}</p>
        <div className="mt-3 flex justify-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] ${payment.tone}`}>
            {payment.label}
          </span>
          <StageBadge stage={order.fulfillment_status} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Section title="Customer">
          <p className="text-lg font-bold">
            {order.customer_first_name} {order.customer_last_name}
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <a href={`tel:${order.customer_phone}`} className="underline underline-offset-2">
                {order.customer_phone}
              </a>
            </li>
            {order.customer_email && (
              <li>
                <a href={`mailto:${order.customer_email}`} className="break-all underline underline-offset-2">
                  {order.customer_email}
                </a>
              </li>
            )}
            <li className="text-black-900/60">Collecting at {order.pickup_location_name}</li>
          </ul>
        </Section>

        <Section title="Timeline">
          <ol className="space-y-2 text-sm">
            {timeline.map((step) => (
              <li key={step.label} className="flex justify-between gap-4">
                <span className={step.at ? 'font-bold' : 'text-black-900/40'}>{step.label}</span>
                <span className={`tabular-nums ${step.at ? '' : 'text-black-900/40'}`}>{formatDateTime(step.at)}</span>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <Section title="Order">
        <ul className="divide-y divide-dashed divide-black-900/15">
          {order.items.map((line) => (
            <li key={line.key} className="flex justify-between gap-4 py-2.5 first:pt-0">
              <span className="min-w-0">
                <span className="font-bold">
                  {line.quantity}× {line.item.name.trim()}
                </span>
                {line.addOns.length > 0 && (
                  <span className="block text-xs text-black-900/60">+ {line.addOns.map((a) => a.name).join(', ')}</span>
                )}
              </span>
              <span className="shrink-0 tabular-nums">{formatRand(lineTotal(line))}</span>
            </li>
          ))}
        </ul>

        {order.notes && (
          <p className="mt-4 border-l-4 border-black-900 pl-3 text-sm">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-black-900/50">Customer note</span>
            {order.notes}
          </p>
        )}

        <div className="mt-4 flex items-baseline justify-between border-t border-black-900/15 pt-3">
          <span className="text-sm font-bold">{order.status === 'paid' ? 'Total paid' : 'Total'}</span>
          <span className="text-xl font-bold tabular-nums">{formatRand(Number(order.total))}</span>
        </div>
      </Section>
    </div>
  )
}
