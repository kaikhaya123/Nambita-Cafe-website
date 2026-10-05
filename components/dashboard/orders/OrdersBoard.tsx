'use client'

// The kitchen orders board: three columns (New, Preparing, Ready for Collection).
// Checks for new orders every 5 seconds, marks newly arrived ones with a "New" badge and plays a sound.
// Each card shows the branch, what was ordered, the customer's note and how long it has been waiting.
// If the board can't reach the server, a red bar warns that the orders shown may be out of date.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { formatDate, formatMinutes, formatRand, formatTime } from '@/lib/format'
import { playNewOrderSound, unlockSound } from '@/lib/new-order-sound'
import { ticketNumber, type FulfillmentStatus, type StaffOrder } from '@/lib/orders'
import type { StaffRole } from '@/lib/staff-auth'

const POLL_INTERVAL_MS = 5000
// Show the connection warning after this many failed checks in a row (2 × 5 s = 10 seconds),
// so one slow answer doesn't make the warning flash on and off.
const FAILED_CHECKS_BEFORE_WARNING = 2
// Waiting times are shown in red once an order has waited this long.
const LATE_AFTER_MINUTES = 15
// How often the waiting times count up when nothing else changes.
const CLOCK_TICK_MS = 30_000

interface Props {
  role: StaffRole
  staffName: string
}

const columns: {
  status: Exclude<FulfillmentStatus, 'collected'>
  title: string
  action: string
  next: FulfillmentStatus
  emptyIcon: string
}[] = [
  { status: 'new', title: 'New Orders', action: 'Start Preparing', next: 'preparing', emptyIcon: '/Icons/order.png' },
  { status: 'preparing', title: 'Preparing', action: 'Mark Ready', next: 'ready', emptyIcon: '/Icons/tool.png' },
  { status: 'ready', title: 'Ready for Collection', action: 'Collected', next: 'collected', emptyIcon: '/Icons/paper-bag.png' },
]

export default function OrdersBoard({ role, staffName }: Readonly<Props>) {
  const router = useRouter()
  const [orders, setOrders] = useState<StaffOrder[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [pending, setPending] = useState<Record<string, boolean>>({})
  const [freshOrders, setFreshOrders] = useState<Set<string>>(new Set())
  // Connection: true while the board can't reach the server, plus when it last loaded orders.
  const [isConnectionLost, setIsConnectionLost] = useState(false)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null)
  const [soundOn, setSoundOn] = useState(false)
  // "Now", for the waiting times. Updated by the clock below.
  const [now, setNow] = useState(() => Date.now())

  const seenOrders = useRef<Set<string> | null>(null)
  const failedChecks = useRef(0)

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/staff/orders', { cache: 'no-store' })
      if (response.status === 401) {
        router.replace('/nambita-staff-access')
        return
      }
      if (!response.ok) throw new Error('Could not load orders.')
      const data = (await response.json()) as { orders: StaffOrder[] }

      const incomingNew = data.orders.filter((o) => o.fulfillment_status === 'new').map((o) => o.order_number)
      if (seenOrders.current) {
        const arrivals = incomingNew.filter((id) => !seenOrders.current!.has(id))
        if (arrivals.length > 0) {
          setFreshOrders((prev) => new Set([...prev, ...arrivals]))
          playNewOrderSound()
        }
      } else {
        seenOrders.current = new Set()
      }
      data.orders.forEach((o) => seenOrders.current!.add(o.order_number))

      setOrders(data.orders)
      failedChecks.current = 0
      setIsConnectionLost(false)
      setLastUpdatedAt(Date.now())
      setNow(Date.now())
    } catch {
      // Keep showing the last orders we have; the next poll will retry.
      failedChecks.current += 1
      if (failedChecks.current >= FAILED_CHECKS_BEFORE_WARNING) setIsConnectionLost(true)
    } finally {
      setIsLoaded(true)
    }
  }, [router])

  useEffect(() => {
    fetchOrders()
    const poll = window.setInterval(fetchOrders, POLL_INTERVAL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchOrders()
    }
    // The device itself says it has lost its internet connection: warn straight away.
    const onOffline = () => setIsConnectionLost(true)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', fetchOrders)
    return () => {
      window.clearInterval(poll)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', fetchOrders)
    }
  }, [fetchOrders])

  // Keeps the waiting times counting up, even while the connection is down.
  useEffect(() => {
    const clock = window.setInterval(() => setNow(Date.now()), CLOCK_TICK_MS)
    return () => window.clearInterval(clock)
  }, [])

  // Sound: browsers only allow it after a tap. If the staff member just tapped "Log in", it's
  // already allowed; otherwise the first tap anywhere on the board switches it on.
  useEffect(() => {
    const turnOnSound = async () => {
      const on = await unlockSound()
      setSoundOn(on)
      if (on) document.removeEventListener('pointerdown', turnOnSound)
    }
    turnOnSound()
    document.addEventListener('pointerdown', turnOnSound)
    return () => document.removeEventListener('pointerdown', turnOnSound)
  }, [])

  async function moveOrder(orderNumber: string, status: FulfillmentStatus) {
    setPending((prev) => ({ ...prev, [orderNumber]: true }))
    setFreshOrders((prev) => {
      const next = new Set(prev)
      next.delete(orderNumber)
      return next
    })

    const previous = orders
    setOrders((current) =>
      current.map((o) => (o.order_number === orderNumber ? { ...o, fulfillment_status: status } : o))
    )

    try {
      const response = await fetch(`/api/staff/orders/${encodeURIComponent(orderNumber)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (response.status === 401) {
        router.replace('/nambita-staff-access')
        return
      }
      if (!response.ok) throw new Error('Update failed')
      const { order } = (await response.json()) as { order: StaffOrder }
      setOrders((current) => current.map((o) => (o.order_number === orderNumber ? order : o)))
    } catch {
      // Put the card back where it was so staff can try again.
      setOrders(previous)
    } finally {
      setPending((prev) => {
        const next = { ...prev }
        delete next[orderNumber]
        return next
      })
    }
  }

  const byStatus = useMemo(() => {
    const groups: Record<FulfillmentStatus, StaffOrder[]> = { new: [], preparing: [], ready: [], collected: [] }
    orders.forEach((o) => groups[o.fulfillment_status]?.push(o))
    return groups
  }, [orders])

  return (
    <DashboardShell role={role} staffName={staffName}>
      <h1 className="sr-only">Orders board</h1>

      {isConnectionLost && (
        <p role="alert" className="bg-red-700 px-4 py-3 text-center text-sm font-bold text-white">
          No connection: new orders may be missing.
          {lastUpdatedAt !== null && ` Last updated ${formatTime(lastUpdatedAt)}.`} Retrying…
        </p>
      )}
      {!soundOn && (
        <button
          type="button"
          onClick={() => unlockSound().then(setSoundOn)}
          className="bg-black-900 px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.08em] text-brand-yellow underline underline-offset-4"
        >
          Tap here to turn on the new-order sound
        </button>
      )}

      <main className="grid flex-1 grid-cols-1 lg:grid-cols-3">
        {columns.map((column) => {
          const columnOrders = byStatus[column.status]
          // Preparing is fully black; New Orders and Ready for Collection are fully Nambita yellow.
          const isDark = column.status === 'preparing'
          return (
            <section
              key={column.status}
              aria-labelledby={`col-${column.status}`}
              className={`flex min-w-0 flex-col ${isDark ? 'bg-black-900 text-white' : 'bg-brand-yellow text-black-900'}`}
            >
              <div
                className={`flex h-16 items-center justify-center px-4 ${
                  isDark ? 'bg-black-900 text-white' : 'bg-brand-yellow text-black-900'
                }`}
              >
                <h2
                  id={`col-${column.status}`}
                  className="mr-[-0.06em] translate-y-[0.07em] truncate text-center font-teko text-2xl uppercase leading-none tracking-[0.06em] xl:text-3xl"
                >
                  {column.title}
                </h2>
              </div>

              <div className="flex flex-1 flex-col p-4 sm:p-6">
                {!isLoaded && (
                  <p
                    className={`flex min-h-40 flex-1 items-center justify-center p-6 text-center text-sm ${
                      isDark ? 'text-white/80' : 'text-black-900/80'
                    }`}
                  >
                    Loading orders…
                  </p>
                )}
                {isLoaded && columnOrders.length === 0 && (
                  <div className="flex min-h-56 flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
                    <Image
                      src={column.emptyIcon}
                      alt=""
                      width={512}
                      height={512}
                      className={`h-24 w-24 object-contain lg:h-28 lg:w-28 xl:h-32 xl:w-32 ${
                        isDark ? 'opacity-40 invert' : 'opacity-25'
                      }`}
                    />
                    <p className={`text-base ${isDark ? 'text-white/80' : 'text-black-900/80'}`}>No orders here</p>
                  </div>
                )}
                {columnOrders.map((order) => (
                  <OrderCard
                    key={order.order_number}
                    order={order}
                    isDark={isDark}
                    actionLabel={column.action}
                    now={now}
                    isFresh={freshOrders.has(order.order_number)}
                    isBusy={!!pending[order.order_number]}
                    onAdvance={() => moveOrder(order.order_number, column.next)}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </main>
    </DashboardShell>
  )
}

// Colours for an order sitting directly on a yellow column (light) or the black Preparing column (dark).
const cardTheme = {
  light: {
    divider: 'border-black-900/30',
    newBadge: 'bg-black-900 text-brand-yellow',
    action: 'bg-black-900 text-white',
    label: 'text-black-900/80',
    late: 'text-red-700',
    note: 'bg-black-900/10',
  },
  dark: {
    divider: 'border-white/30',
    newBadge: 'bg-brand-yellow text-black-900',
    action: 'bg-white text-black-900',
    label: 'text-white/80',
    late: 'text-red-400',
    note: 'bg-white/10',
  },
}

// One order, drawn straight onto the column (no box around it). Laid out the way the kitchen reads it:
//   Order No. 005
//   Customer details: / Khayalami Zondi
//   Order: / 1× 6 WINGS + FRIES
//   Amount: R85.00 · Date: 30 Sept 2026 · Time: 07:04 · Branch: KwaMashu
// then how long it has waited, the customer's note, and a button to move it on.
// Tap the order number for the full details. A thin line separates it from the next order.
function OrderCard({
  order,
  now,
  isDark,
  actionLabel,
  isFresh,
  isBusy,
  onAdvance,
}: Readonly<{
  order: StaffOrder
  now: number
  isDark: boolean
  actionLabel: string
  isFresh: boolean
  isBusy: boolean
  onAdvance: () => void
}>) {
  const isReady = order.fulfillment_status === 'ready'
  const theme = isDark ? cardTheme.dark : cardTheme.light
  const ticket = ticketNumber(order.order_number)
  const branch = order.pickup_location_name.replace('Nambita Cafe ', '')
  const waitedMinutes = Math.max(0, (now - new Date(order.created_at).getTime()) / 60_000)
  const isLate = waitedMinutes >= LATE_AFTER_MINUTES

  return (
    <article
      className={`flex flex-col gap-3 border-b py-5 first:pt-0 last:border-b-0 last:pb-0 ${theme.divider} ${
        isBusy ? 'opacity-60' : ''
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Tap the number to see the full order (customer, phone, timeline) on its details page. */}
          <Link
            href={`/dashboard/history/${order.order_number}`}
            className="font-teko text-4xl uppercase leading-none tracking-[0.04em] underline-offset-4 hover:underline"
            title="See order details"
          >
            Order No. {ticket}
          </Link>
          {isFresh && (
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${theme.newBadge}`}>
              New
            </span>
          )}
        </div>
      </div>

      <dl className="space-y-2 text-sm">
        <div>
          <dt className={`font-bold ${theme.label}`}>Customer details:</dt>
          <dd className="font-bold">
            {order.customer_first_name} {order.customer_last_name}
          </dd>
        </div>
        <div>
          <dt className={`font-bold ${theme.label}`}>Order:</dt>
          <dd>
            <ul className="font-bold">
              {order.items.map((line) => (
                <li key={line.key}>
                  {line.quantity}× {line.item.name.trim()}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <OrderDetail label="Amount" labelClass={theme.label}>{formatRand(Number(order.total))}</OrderDetail>
        <OrderDetail label="Date" labelClass={theme.label}>{formatDate(order.created_at)}</OrderDetail>
        <OrderDetail label="Time" labelClass={theme.label}>{formatTime(order.created_at)}</OrderDetail>
        <OrderDetail label="Branch" labelClass={theme.label}>{branch}</OrderDetail>
      </dl>

      <p className={`text-xs font-bold uppercase tracking-[0.08em] ${isLate ? theme.late : theme.label}`}>
        {waitedMinutes < 1 ? 'Placed just now' : `Waiting ${formatMinutes(waitedMinutes)}`}
      </p>

      {order.notes && (
        <p className={`rounded-lg px-3 py-2 text-sm ${theme.note}`}>
          <span className="font-bold">Note:</span> {order.notes}
        </p>
      )}

      <button
        type="button"
        onClick={onAdvance}
        disabled={isBusy}
        aria-label={`${actionLabel}: order number ${ticket}`}
        className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-transform active:scale-[0.97] disabled:opacity-40 ${
          // "Collected" is bright green with black text (white on bright green is too faint to read).
          isReady ? 'bg-green-500 text-black-900' : theme.action
        }`}
      >
        {actionLabel}
      </button>
    </article>
  )
}

// One "Label: value" line on an order card, e.g. "Amount: R85.00".
function OrderDetail({ label, labelClass, children }: Readonly<{ label: string; labelClass: string; children: React.ReactNode }>) {
  return (
    <div className="flex gap-1.5">
      <dt className={`font-bold ${labelClass}`}>{label}:</dt>
      <dd className="font-bold">{children}</dd>
    </div>
  )
}
