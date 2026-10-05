// Order History page body: search box, the list of paid orders (newest first) and Newer/Older page links.
// Each row opens that order's details page.

import Link from 'next/link'
import StageBadge from '@/components/dashboard/history/StageBadge'
import { formatDateTime, formatRand } from '@/lib/format'
import { ticketNumber } from '@/lib/orders'
import { HISTORY_PAGE_SIZE, type OrderHistoryRow } from '@/lib/order-history'

function pageHref(search: string, page: number) {
  const params = new URLSearchParams()
  if (search) params.set('q', search)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return `/dashboard/history${query ? `?${query}` : ''}`
}

// "1× 6 WINGS + FRIES, 2× ICED COFFEE"
function itemsSummary(row: OrderHistoryRow) {
  return row.items.map((line) => `${line.quantity}× ${line.item.name.trim()}`).join(', ')
}

export default function OrderHistoryList({
  rows,
  total,
  page,
  search,
}: Readonly<{ rows: OrderHistoryRow[]; total: number; page: number; search: string }>) {
  const first = total === 0 ? 0 : (page - 1) * HISTORY_PAGE_SIZE + 1
  const last = Math.min(page * HISTORY_PAGE_SIZE, total)
  const hasOlder = last < total

  return (
    <div className="space-y-5">
      {/* A plain form: submitting it reloads the page with ?q=..., so it works without extra JavaScript. */}
      <form action="/dashboard/history" className="flex gap-2">
        <label htmlFor="history-search" className="sr-only">
          Search orders
        </label>
        <input
          id="history-search"
          name="q"
          type="search"
          defaultValue={search}
          placeholder="Order No. (e.g. 005) or customer name"
          className="min-w-0 flex-1 rounded-full border border-black-900/50 bg-white px-5 py-3 text-sm outline-none focus:border-black-900 focus:ring-1 focus:ring-black-900"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-black-900 px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white"
        >
          Search
        </button>
      </form>

      <div className="flex items-center justify-between text-xs text-black-900/80">
        <p>{total === 0 ? 'No orders found' : `Showing ${first}–${last} of ${total} paid orders`}</p>
        {search && (
          <Link href="/dashboard/history" className="font-bold text-black-900 underline underline-offset-2">
            Clear search
          </Link>
        )}
      </div>

      {rows.length > 0 && (
        <ul className="divide-y divide-black-900/20 overflow-hidden rounded-2xl border border-black-900/20 bg-white">
          {rows.map((row) => (
            <li key={row.order_number}>
              <Link
                href={`/dashboard/history/${row.order_number}`}
                className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-brand-offwhite sm:grid-cols-[9rem_minmax(0,1fr)_auto_auto] sm:items-center"
              >
                <span className="font-teko text-2xl uppercase leading-none tracking-[0.04em]">
                  Order No. {ticketNumber(row.order_number)}
                </span>
                <span className="justify-self-end sm:order-last">
                  <StageBadge stage={row.fulfillment_status} />
                </span>
                <span className="col-span-2 min-w-0 sm:col-span-1">
                  <span className="block truncate text-sm font-bold">
                    {row.customer_first_name} {row.customer_last_name}
                  </span>
                  <span className="block truncate text-xs text-black-900/80">{itemsSummary(row)}</span>
                </span>
                <span className="col-span-2 text-xs text-black-900/80 sm:col-span-1 sm:text-right">
                  <span className="block font-bold text-black-900">{formatRand(Number(row.total))}</span>
                  {formatDateTime(row.created_at)} · {row.pickup_location_name.replace('Nambita Cafe ', '')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {(page > 1 || hasOlder) && (
        <nav aria-label="Pages" className="flex justify-between">
          {page > 1 ? (
            <Link href={pageHref(search, page - 1)} className="rounded-full border border-black-900/60 px-5 py-2 text-xs font-bold uppercase tracking-[0.08em] hover:border-black-900">
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          {hasOlder && (
            <Link href={pageHref(search, page + 1)} className="rounded-full border border-black-900/60 px-5 py-2 text-xs font-bold uppercase tracking-[0.08em] hover:border-black-900">
              Older →
            </Link>
          )}
        </nav>
      )}
    </div>
  )
}
