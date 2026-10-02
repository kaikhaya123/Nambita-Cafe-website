// Server-only. Loads orders for the staff Order History page (/dashboard/history) and the
// single-order details page (/dashboard/history/<order number>).

import type { OrderLine } from '@/lib/menu-data'
import type { FulfillmentStatus } from '@/lib/orders'
import { getSupabaseAdmin } from '@/lib/supabase'

export const HISTORY_PAGE_SIZE = 25

/** One row in the history list. */
export interface OrderHistoryRow {
  order_number: string
  fulfillment_status: FulfillmentStatus
  customer_first_name: string
  customer_last_name: string
  pickup_location_name: string
  items: OrderLine[]
  total: number
  created_at: string
}

/** Everything about one order, for the details page. */
export interface OrderDetails extends OrderHistoryRow {
  status: 'pending' | 'paid' | 'failed' | 'cancelled'
  customer_phone: string
  customer_email: string | null
  notes: string | null
  subtotal: number
  preparing_at: string | null
  ready_at: string | null
  collected_at: string | null
}

const ROW_COLUMNS =
  'order_number, fulfillment_status, customer_first_name, customer_last_name, pickup_location_name, items, total, created_at'
const DETAIL_COLUMNS = `${ROW_COLUMNS}, status, customer_phone, customer_email, notes, subtotal, preparing_at, ready_at, collected_at`

// Full order references look like NC-2026-0042 (see supabase/orders.sql).
const ORDER_REF_PATTERN = /^NC-\d{4}-\d{4,10}$/i

/**
 * Paid orders, newest first, one page at a time. `search` can be:
 * - an order number as staff see it ("005", "Order No. 5"): matches every order with that short number,
 * - a full reference ("NC-2026-0005"),
 * - a customer name or part of one ("khaya", "Khayalami Zondi").
 */
export async function listOrderHistory(search: string, page: number) {
  const from = (page - 1) * HISTORY_PAGE_SIZE
  let query = getSupabaseAdmin()
    .from('orders')
    .select(ROW_COLUMNS, { count: 'exact' })
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .range(from, from + HISTORY_PAGE_SIZE - 1)

  const term = search.trim()
  const shortNumber = /^(?:order\s*no\.?\s*)?#?\s*(\d{1,3})$/i.exec(term)
  if (shortNumber && Number(shortNumber[1]) >= 1 && Number(shortNumber[1]) <= 100) {
    // Short numbers repeat every 100 orders (005 = order 5, 105, 205 …), and an order's short number
    // is the last two digits of its reference (100 -> "00"). So "005" finds every reference ending in "05".
    const lastTwoDigits = String(Number(shortNumber[1]) % 100).padStart(2, '0')
    query = query.like('order_number', `%${lastTwoDigits}`)
  } else if (ORDER_REF_PATTERN.test(term)) {
    query = query.eq('order_number', term.toUpperCase())
  } else if (term) {
    // Names only: keep letters, spaces, hyphens and apostrophes so the search can't break the query.
    const words = term
      .replace(/[^\p{L}\s'-]/gu, '')
      .split(/\s+/)
      .filter(Boolean)
    if (words.length === 1) {
      // Inside .or() the wildcard is written as * (PostgREST's form of %).
      query = query.or(`customer_first_name.ilike.*${words[0]}*,customer_last_name.ilike.*${words[0]}*`)
    } else if (words.length > 1) {
      // "Khayalami Zondi": first word in the first name, last word in the surname.
      query = query
        .ilike('customer_first_name', `%${words[0]}%`)
        .ilike('customer_last_name', `%${words[words.length - 1]}%`)
    }
  }

  const { data, error, count } = await query
  // PGRST103 = asked for a page past the last one (e.g. an old link): just show no rows.
  if (error && error.code !== 'PGRST103') throw error
  return { rows: (error ? [] : (data ?? [])) as OrderHistoryRow[], total: count ?? 0 }
}

/** One order by its full reference, or null if there's no such order. */
export async function getOrderDetails(orderNumber: string) {
  if (!ORDER_REF_PATTERN.test(orderNumber)) return null
  const { data, error } = await getSupabaseAdmin()
    .from('orders')
    .select(DETAIL_COLUMNS)
    .eq('order_number', orderNumber.toUpperCase())
    .maybeSingle()
  if (error) throw error
  return (data as OrderDetails | null) ?? null
}
