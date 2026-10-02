'use client'

// The kitchen orders board: three columns (New, Preparing, Ready for Collection).
// Checks for new orders every 5 seconds and marks newly arrived ones with a "New" badge.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { ticketNumber, type FulfillmentStatus, type StaffOrder } from '@/lib/orders'
import type { StaffRole } from '@/lib/staff-auth'

const POLL_INTERVAL_MS = 5000

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

  const seenOrders = useRef<Set<string> | null>(null)


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
        }
      } else {
        seenOrders.current = new Set()
      }
      data.orders.forEach((o) => seenOrders.current!.add(o.order_number))

      setOrders(data.orders)
    } catch {
      // Keep showing the last orders we have; the next poll will retry.
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
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(poll)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [fetchOrders])

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
                      isDark ? 'text-white/60' : 'text-black-900/50'
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
                    <p className={`text-base ${isDark ? 'text-white/50' : 'text-black-900/40'}`}>No orders here</p>
                  </div>
                )}
                {columnOrders.map((order) => (
                  <OrderCard
                    key={order.order_number}
                    order={order}
                    isDark={isDark}
                    actionLabel={column.action}
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
    divider: 'border-black-900/20',
    newBadge: 'bg-black-900 text-brand-yellow',
    action: 'bg-black-900 text-white',
  },
  dark: {
    divider: 'border-white/20',
    newBadge: 'bg-brand-yellow text-black-900',
    action: 'bg-white text-black-900',
  },
}

// One order, drawn straight onto the column (no box around it): just the short order number
// (tap it for the full details) and a small button to move it on. A thin line separates it from the next order.
function OrderCard({
  order,
  isDark,
  actionLabel,
  isFresh,
  isBusy,
  onAdvance,
}: Readonly<{
  order: StaffOrder
  isDark: boolean
  actionLabel: string
  isFresh: boolean
  isBusy: boolean
  onAdvance: () => void
}>) {
  const isReady = order.fulfillment_status === 'ready'
  const theme = isDark ? cardTheme.dark : cardTheme.light
  const ticket = ticketNumber(order.order_number)

  return (
    <article
      className={`flex flex-col items-center gap-3 border-b py-5 first:pt-0 last:border-b-0 last:pb-0 ${theme.divider} ${
        isBusy ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        {/* Tap the number to see the full order (items, note, customer) on its details page. */}
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

      <button
        type="button"
        onClick={onAdvance}
        disabled={isBusy}
        aria-label={`${actionLabel}: order number ${ticket}`}
        className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-transform active:scale-[0.97] disabled:opacity-40 ${
          isReady ? 'bg-brand-green text-white' : theme.action
        }`}
      >
        {actionLabel}
      </button>
    </article>
  )
}
