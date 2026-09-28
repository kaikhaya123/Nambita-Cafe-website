import { getSupabaseAdmin } from '@/lib/supabase'
import { cafeLocations } from '@/lib/cafe-locations'
import { lineTotal, type OrderLine } from '@/lib/menu-data'

// Server-only. Reporting over paid orders, in South African time (UTC+2, no daylight saving).

const SAST_OFFSET_MS = 2 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000
const PAGE_SIZE = 1000 // Supabase's default max rows per request

export const reportRanges = {
  today: { label: 'Today', days: 1, compareLabel: 'vs yesterday so far' },
  '7d': { label: 'Last 7 days', days: 7, compareLabel: 'vs previous 7 days' },
  '30d': { label: 'Last 30 days', days: 30, compareLabel: 'vs previous 30 days' },
} as const

export type ReportRangeKey = keyof typeof reportRanges

export function parseRange(value: string | string[] | undefined): ReportRangeKey {
  return typeof value === 'string' && value in reportRanges ? (value as ReportRangeKey) : 'today'
}

interface AnalyticsOrder {
  total: number
  created_at: string
  pickup_location_id: string
  items: OrderLine[]
  preparing_at: string | null
  ready_at: string | null
  collected_at: string | null
}

// Midnight SAST at the start of the range (today counts as day 1), plus the equal-length
// window just before it, ending at the same time of day as now.
function rangeWindow(range: ReportRangeKey, now = Date.now()) {
  const sastNow = now + SAST_OFFSET_MS
  const sastMidnightToday = sastNow - (sastNow % DAY_MS) - SAST_OFFSET_MS
  const start = sastMidnightToday - (reportRanges[range].days - 1) * DAY_MS
  const span = reportRanges[range].days * DAY_MS
  return { start, end: now, previousStart: start - span, previousEnd: now - span }
}

async function fetchPaidOrders(fromMs: number, toMs: number): Promise<AnalyticsOrder[]> {
  const supabase = getSupabaseAdmin()
  const rows: AnalyticsOrder[] = []

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('orders')
      .select('total, created_at, pickup_location_id, items, preparing_at, ready_at, collected_at')
      .eq('status', 'paid')
      .gte('created_at', new Date(fromMs).toISOString())
      .lt('created_at', new Date(toMs).toISOString())
      .order('created_at', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) throw error
    rows.push(...((data ?? []) as AnalyticsOrder[]))
    if (!data || data.length < PAGE_SIZE) break
  }

  return rows.map((row) => ({ ...row, total: Number(row.total) }))
}

function sastParts(iso: string) {
  const sast = new Date(new Date(iso).getTime() + SAST_OFFSET_MS)
  return { hour: sast.getUTCHours(), dayKey: sast.toISOString().slice(0, 10) }
}

function averageMinutes(pairs: [string | null, string | null][]) {
  const durations = pairs
    .filter((pair): pair is [string, string] => Boolean(pair[0] && pair[1]))
    .map(([from, to]) => (new Date(to).getTime() - new Date(from).getTime()) / 60000)
    .filter((minutes) => minutes >= 0)
  if (durations.length === 0) return null
  return durations.reduce((sum, m) => sum + m, 0) / durations.length
}

function sumRevenue(orders: AnalyticsOrder[]) {
  return orders.reduce((sum, o) => sum + o.total, 0)
}

export interface SeriesPoint {
  key: string
  label: string
  revenue: number
  orders: number
}

export interface SalesReport {
  range: ReportRangeKey
  revenue: number
  orders: number
  averageOrderValue: number | null
  itemsSold: number
  previousRevenue: number
  previousOrders: number
  byBranch: { id: string; name: string; revenue: number; orders: number }[]
  byHour: SeriesPoint[]
  byDay: SeriesPoint[]
  avgPrepMinutes: number | null
  avgCollectionWaitMinutes: number | null
}

export async function getSalesReport(range: ReportRangeKey): Promise<SalesReport> {
  const window = rangeWindow(range)
  const [orders, previous] = await Promise.all([
    fetchPaidOrders(window.start, window.end),
    fetchPaidOrders(window.previousStart, window.previousEnd),
  ])

  const revenue = sumRevenue(orders)

  const byBranch = cafeLocations.map((location) => {
    const branchOrders = orders.filter((o) => o.pickup_location_id === location.id)
    return {
      id: location.id,
      name: location.name.replace('Nambita Cafe ', ''),
      revenue: sumRevenue(branchOrders),
      orders: branchOrders.length,
    }
  })

  const byHour: SeriesPoint[] = Array.from({ length: 24 }, (_, hour) => ({
    key: String(hour),
    label: `${String(hour).padStart(2, '0')}:00`,
    revenue: 0,
    orders: 0,
  }))

  const byDay: SeriesPoint[] = Array.from({ length: reportRanges[range].days }, (_, index) => {
    const dayStart = window.start + index * DAY_MS
    const key = new Date(dayStart + SAST_OFFSET_MS).toISOString().slice(0, 10)
    const label = new Date(dayStart).toLocaleDateString('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      day: 'numeric',
      month: 'short',
    })
    return { key, label, revenue: 0, orders: 0 }
  })
  const dayIndex = new Map(byDay.map((point, index) => [point.key, index]))

  let itemsSold = 0
  for (const order of orders) {
    const { hour, dayKey } = sastParts(order.created_at)
    byHour[hour].revenue += order.total
    byHour[hour].orders += 1
    const index = dayIndex.get(dayKey)
    if (index !== undefined) {
      byDay[index].revenue += order.total
      byDay[index].orders += 1
    }
    itemsSold += order.items.reduce((sum, line) => sum + line.quantity, 0)
  }

  return {
    range,
    revenue,
    orders: orders.length,
    averageOrderValue: orders.length ? revenue / orders.length : null,
    itemsSold,
    previousRevenue: sumRevenue(previous),
    previousOrders: previous.length,
    byBranch,
    byHour,
    byDay,
    avgPrepMinutes: averageMinutes(orders.map((o) => [o.created_at, o.ready_at])),
    avgCollectionWaitMinutes: averageMinutes(orders.map((o) => [o.ready_at, o.collected_at])),
  }
}

export interface MenuItemStat {
  id: string
  name: string
  quantity: number
  revenue: number
  orders: number
}

export interface MenuReport {
  range: ReportRangeKey
  totalOrders: number
  items: MenuItemStat[]
  addOns: { name: string; quantity: number; revenue: number }[]
}

export async function getMenuReport(range: ReportRangeKey): Promise<MenuReport> {
  const window = rangeWindow(range)
  const orders = await fetchPaidOrders(window.start, window.end)

  const items = new Map<string, MenuItemStat & { orderSet: Set<number> }>()
  const addOns = new Map<string, { name: string; quantity: number; revenue: number }>()

  orders.forEach((order, orderIndex) => {
    for (const line of order.items) {
      const entry = items.get(line.item.id) ?? {
        id: line.item.id,
        name: line.item.name,
        quantity: 0,
        revenue: 0,
        orders: 0,
        orderSet: new Set<number>(),
      }
      entry.quantity += line.quantity
      entry.revenue += lineTotal(line)
      entry.orderSet.add(orderIndex)
      items.set(line.item.id, entry)

      for (const addOn of line.addOns) {
        const addOnEntry = addOns.get(addOn.name) ?? { name: addOn.name, quantity: 0, revenue: 0 }
        addOnEntry.quantity += line.quantity
        addOnEntry.revenue += addOn.price * line.quantity
        addOns.set(addOn.name, addOnEntry)
      }
    }
  })

  return {
    range,
    totalOrders: orders.length,
    items: [...items.values()]
      .map(({ orderSet, ...stat }) => ({ ...stat, orders: orderSet.size }))
      .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue),
    addOns: [...addOns.values()].sort((a, b) => b.quantity - a.quantity),
  }
}
