'use client'

// The kitchen orders board: three columns (New, Preparing, Ready for Collection).
// Checks for new orders every 5 seconds and can play a chime when one arrives.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import DashboardShell from '@/components/dashboard/DashboardShell'
import type { FulfillmentStatus, StaffOrder } from '@/lib/orders'
import type { StaffRole } from '@/lib/staff-auth'

const POLL_INTERVAL_MS = 5000

interface Props {
  locations: { id: string; name: string }[]
  role: StaffRole
  staffName: string
}

const columns: {
  status: Exclude<FulfillmentStatus, 'collected'>
  title: string
  accent: string
  action: string
  next: FulfillmentStatus
  emptyIcon: string
}[] = [
  { status: 'new', title: 'New Orders', accent: 'bg-brand-yellow', action: 'Start Preparing', next: 'preparing', emptyIcon: '/Icons/order.png' },
  { status: 'preparing', title: 'Preparing', accent: 'bg-brand-caramel', action: 'Mark Ready', next: 'ready', emptyIcon: '/Icons/tool.png' },
  { status: 'ready', title: 'Ready for Collection', accent: 'bg-brand-green', action: 'Collected', next: 'collected', emptyIcon: '/Icons/paper-bag.png' },
]

const previousStatus: Record<FulfillmentStatus, FulfillmentStatus | null> = {
  new: null,
  preparing: 'new',
  ready: 'preparing',
  collected: 'ready',
}

function minutesSince(iso: string | null, now: number) {
  if (!iso) return 0
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000))
}

// Short "how long ago" label for order cards, e.g. "just now", "12 min", "1h 5m".
function formatWaitTime(minutes: number) {
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

type Urgency = 'normal' | 'warn' | 'late'

const urgencyClasses: Record<Urgency, string> = {
  normal: 'bg-black-900/5 text-black-900/70',
  warn: 'bg-amber-200 text-amber-900',
  late: 'bg-red-600 text-white',
}

// Kitchen urgency based on time since the order was placed. Ready orders are never urgent.
function getUrgency(isReady: boolean, waitingMinutes: number): Urgency {
  if (isReady) return 'normal'
  if (waitingMinutes >= 20) return 'late'
  if (waitingMinutes >= 10) return 'warn'
  return 'normal'
}

function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
}

function playChime(ctx: AudioContext) {
  const start = ctx.currentTime
  ;[880, 1320].forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const t = start + i * 0.18
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.35, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.4)
  })
}

export default function OrdersBoard({ locations, role, staffName }: Readonly<Props>) {
  const router = useRouter()
  const [orders, setOrders] = useState<StaffOrder[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [pending, setPending] = useState<Record<string, boolean>>({})
  const [freshOrders, setFreshOrders] = useState<Set<string>>(new Set())
  const [soundOn, setSoundOn] = useState(false)

  const seenOrders = useRef<Set<string> | null>(null)
  const audioCtx = useRef<AudioContext | null>(null)
  const soundOnRef = useRef(false)

  const showLocation = locations.length > 1

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
          if (soundOnRef.current && audioCtx.current) playChime(audioCtx.current)
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
    const tick = window.setInterval(() => setNow(Date.now()), 15000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchOrders()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(poll)
      window.clearInterval(tick)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [fetchOrders])

  function toggleSound() {
    if (!soundOn) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioCtx.current ??= new Ctx()
      audioCtx.current.resume()
      playChime(audioCtx.current)
    }
    soundOnRef.current = !soundOn
    setSoundOn(!soundOn)
  }

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

  const headerControls = (
    <>
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={soundOn}
        className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] ${
          soundOn ? 'border-brand-yellow text-brand-yellow' : 'border-white text-white'
        }`}
      >
        {soundOn ? 'Sound On' : <><span className="max-sm:hidden">Enable </span>Sound</>}
      </button>
    </>
  )

  return (
    <DashboardShell role={role} staffName={staffName} headerRight={headerControls}>
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

              <div className="flex flex-1 flex-col gap-3 p-4 sm:p-6">
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
                    now={now}
                    accent={column.accent}
                    actionLabel={column.action}
                    isFresh={freshOrders.has(order.order_number)}
                    isBusy={!!pending[order.order_number]}
                    showLocation={showLocation}
                    onAdvance={() => moveOrder(order.order_number, column.next)}
                    onBack={
                      previousStatus[column.status]
                        ? () => moveOrder(order.order_number, previousStatus[column.status]!)
                        : undefined
                    }
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

function OrderCard({
  order,
  now,
  accent,
  actionLabel,
  isFresh,
  isBusy,
  showLocation,
  onAdvance,
  onBack,
}: Readonly<{
  order: StaffOrder
  now: number
  accent: string
  actionLabel: string
  isFresh: boolean
  isBusy: boolean
  showLocation: boolean
  onAdvance: () => void
  onBack?: () => void
}>) {
  const waitingMinutes = minutesSince(order.created_at, now)
  const readyMinutes = minutesSince(order.ready_at, now)
  const isReady = order.fulfillment_status === 'ready'

  const urgency = getUrgency(isReady, waitingMinutes)
  const itemCount = order.items.reduce((sum, line) => sum + line.quantity, 0)

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow ${
        isFresh ? 'border-black-900 ring-4 ring-brand-yellow' : 'border-black-900/80'
      } ${isBusy ? 'opacity-60' : ''}`}
    >
      <div className={`h-1.5 ${accent}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-teko text-3xl leading-none tracking-[0.02em]">{order.order_number}</p>
              {isFresh && (
                <span className="rounded bg-brand-yellow px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]">New</span>
              )}
            </div>
            <p className="mt-1 truncate text-sm font-bold">
              {order.customer_first_name} {order.customer_last_name}
            </p>
            <a href={`tel:${order.customer_phone}`} className="text-xs text-black-900/60 underline-offset-2 hover:underline">
              {order.customer_phone}
            </a>
          </div>
          <div className="shrink-0 text-right">
            <p
              className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${urgencyClasses[urgency]}`}
            >
              {isReady ? `ready ${formatWaitTime(readyMinutes)}` : formatWaitTime(waitingMinutes)}
            </p>
            <p className="mt-1 text-[11px] text-black-900/50">placed {formatClock(order.created_at)}</p>
          </div>
        </div>

        {showLocation && (
          <p className="mt-2 inline-block rounded bg-black-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
            {order.pickup_location_name.replace('Nambita Cafe ', '')}
          </p>
        )}

        <ul className="mt-3 space-y-1.5 border-t border-dashed border-black-900/20 pt-3">
          {order.items.map((line) => (
            <li key={line.key} className="text-sm">
              <span className="font-bold tabular-nums">{line.quantity}×</span> {line.item.name}
              {line.addOns.length > 0 && (
                <span className="block pl-6 text-xs text-black-900/60">+ {line.addOns.map((a) => a.name).join(', ')}</span>
              )}
            </li>
          ))}
        </ul>

        {order.notes && (
          <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <span className="font-bold uppercase tracking-[0.08em]">Note: </span>
            {order.notes}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-black-900/50">
          <span>
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </span>
          <span className="font-bold text-black-900">R{Number(order.total).toFixed(2)}</span>
        </div>

        <div className="mt-4 flex gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={isBusy}
              aria-label={`Move ${order.order_number} back a step`}
              className="rounded-full border border-black-900/30 px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-black-900/70 hover:border-black-900 disabled:opacity-40"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={onAdvance}
            disabled={isBusy}
            className={`flex-1 rounded-full px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] transition-transform active:scale-[0.98] disabled:opacity-40 ${
              isReady ? 'bg-brand-green text-white' : 'bg-black-900 text-white'
            }`}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </article>
  )
}
