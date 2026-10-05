// Order details page body: the order number, customer, what they ordered, the note, what they paid,
// and a timeline of when it was placed, prepared, made ready and collected.

import Link from 'next/link'
import { ReportIcon, type ReportIconName } from '@/components/dashboard/analytics/ReportIcons'
import StageBadge from '@/components/dashboard/history/StageBadge'
import { formatDateTime, formatRand } from '@/lib/format'
import { lineTotal } from '@/lib/menu-data'
import { ticketNumber } from '@/lib/orders'
import type { OrderDetails } from '@/lib/order-history'

const paymentLabels: Record<OrderDetails['status'], { label: string; tone: string }> = {
  paid: { label: 'Paid', tone: 'bg-brand-green text-white' },
  pending: { label: 'Not paid yet', tone: 'bg-amber-200 text-amber-900' },
  failed: { label: 'Payment failed', tone: 'bg-red-600 text-white' },
  cancelled: { label: 'Cancelled', tone: 'bg-black-900/10 text-black-900/80' },
}

function Section({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="rounded-2xl border border-black-900/20 bg-white p-5 sm:p-6">
      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-black-900/80">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

export default function OrderDetailsView({ order }: Readonly<{ order: OrderDetails }>) {
  const payment = paymentLabels[order.status]
  // Each step has its own icon, coloured like that stage on the kitchen board and badges
  // (New yellow, Preparing black, Ready brand green, Collected bright green).
  const timeline: { label: string; at: string | null; icon: ReportIconName; doneColour: string }[] = [
    { label: 'Placed', at: order.created_at, icon: 'receipt', doneColour: 'bg-brand-yellow text-black-900' },
    { label: 'Started preparing', at: order.preparing_at, icon: 'chef', doneColour: 'bg-black-900 text-white' },
    { label: 'Ready for collection', at: order.ready_at, icon: 'bag', doneColour: 'bg-brand-green text-white' },
    { label: 'Collected', at: order.collected_at, icon: 'check', doneColour: 'bg-green-500 text-black-900' },
  ]

  return (
    <div className="space-y-5">
      <Link href="/dashboard/history" className="inline-block text-xs font-bold uppercase tracking-[0.08em] underline underline-offset-4">
        ← Order history
      </Link>

      {/* Order number and where it's at */}
      <div className="text-center">
        <h1 className="font-teko text-5xl uppercase leading-none tracking-[0.04em]">Order No. {ticketNumber(order.order_number)}</h1>
        <p className="mt-1 text-xs text-black-900/80">Ref {order.order_number}</p>
        <div className="mt-3 flex justify-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] ${payment.tone}`}>
            {payment.label}
          </span>
          <StageBadge stage={order.fulfillment_status} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Section title="Customer">
          {/* Each line starts with an icon (person, phone, envelope, map pin) so staff can scan it quickly. */}
          <p className="flex items-center gap-2.5 text-lg font-bold">
            <ReportIcon name="user" className="h-5 w-5 text-black-900/80" />
            {order.customer_first_name} {order.customer_last_name}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2.5">
              <ReportIcon name="phone" className="h-[18px] w-[18px] text-black-900/80" />
              <a href={`tel:${order.customer_phone}`} className="underline underline-offset-2">
                {order.customer_phone}
              </a>
            </li>
            {order.customer_email && (
              <li className="flex items-center gap-2.5">
                <ReportIcon name="mail" className="h-[18px] w-[18px] text-black-900/80" />
                <a href={`mailto:${order.customer_email}`} className="min-w-0 break-all underline underline-offset-2">
                  {order.customer_email}
                </a>
              </li>
            )}
            <li className="flex items-center gap-2.5 text-black-900/80">
              <ReportIcon name="pin" className="h-[18px] w-[18px]" />
              Collecting at {order.pickup_location_name}
            </li>
          </ul>
        </Section>

        <Section title="Timeline">
          {/* Icon in a circle, then the step and its time underneath. A line joins the circles.
              Steps that haven't happened yet get a faded outline circle and "—" for the time. */}
          <ol className="text-sm">
            {timeline.map((step, index) => {
              const isDone = Boolean(step.at)
              const isLast = index === timeline.length - 1
              return (
                <li key={step.label} className="relative flex gap-3 pb-4 last:pb-0">
                  {!isLast && (
                    <span
                      aria-hidden
                      className={`absolute left-[17px] top-9 h-[calc(100%-2.25rem)] w-0.5 ${
                        timeline[index + 1].at ? 'bg-black-900' : 'bg-black-900/20'
                      }`}
                    />
                  )}
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isDone ? step.doneColour : 'border-2 border-dashed border-black-900/30 text-black-900/40'
                    }`}
                  >
                    <ReportIcon name={step.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <div className="pt-0.5">
                    <p className={isDone ? 'font-bold' : 'text-black-900/80'}>{step.label}</p>
                    <p className="tabular-nums text-black-900/80">{isDone ? formatDateTime(step.at) : 'Not yet'}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </Section>
      </div>

      <Section title="Order">
        <ul className="divide-y divide-dashed divide-black-900/25">
          {order.items.map((line) => (
            <li key={line.key} className="flex justify-between gap-4 py-2.5 first:pt-0">
              <span className="min-w-0">
                <span className="font-bold">
                  {line.quantity}× {line.item.name.trim()}
                </span>
                {line.addOns.length > 0 && (
                  <span className="block text-xs text-black-900/80">+ {line.addOns.map((a) => a.name).join(', ')}</span>
                )}
              </span>
              <span className="shrink-0 tabular-nums">{formatRand(lineTotal(line))}</span>
            </li>
          ))}
        </ul>

        {order.notes && (
          <p className="mt-4 border-l-4 border-black-900 pl-3 text-sm">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-black-900/80">Customer note</span>
            {order.notes}
          </p>
        )}

        <div className="mt-4 flex items-baseline justify-between border-t border-black-900/25 pt-3">
          <span className="text-sm font-bold">{order.status === 'paid' ? 'Total paid' : 'Total'}</span>
          <span className="text-xl font-bold tabular-nums">{formatRand(Number(order.total))}</span>
        </div>
      </Section>
    </div>
  )
}
