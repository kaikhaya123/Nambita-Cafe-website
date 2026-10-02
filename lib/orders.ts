// Order types and the kitchen stages (new -> preparing -> ready -> collected) used by the dashboard and APIs.

import type { OrderLine } from '@/lib/menu-data'

export const fulfillmentStatuses = ['new', 'preparing', 'ready', 'collected'] as const
export type FulfillmentStatus = (typeof fulfillmentStatuses)[number]

// How each kitchen stage is written on screen.
export const fulfillmentLabels: Record<FulfillmentStatus, string> = {
  new: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
  collected: 'Collected',
}

// Column each status stamps when an order moves into it.
export const fulfillmentTimestampColumn: Record<FulfillmentStatus, string | null> = {
  new: null,
  preparing: 'preparing_at',
  ready: 'ready_at',
  collected: 'collected_at',
}

export interface StaffOrder {
  order_number: string
  fulfillment_status: FulfillmentStatus
  customer_first_name: string
  customer_last_name: string
  customer_phone: string
  pickup_location_id: string
  pickup_location_name: string
  notes: string | null
  items: OrderLine[]
  total: number
  created_at: string
  preparing_at: string | null
  ready_at: string | null
  collected_at: string | null
}

export const staffOrderColumns =
  'order_number, fulfillment_status, customer_first_name, customer_last_name, customer_phone, pickup_location_id, pickup_location_name, notes, items, total, created_at, preparing_at, ready_at, collected_at'

// Short ticket numbers go 001, 002 … 100, then start again at 001.
export const TICKET_NUMBER_MAX = 100

/**
 * The short number customers and the kitchen use, e.g. "NC-2026-0005" -> "005", "NC-2026-0100" -> "100",
 * "NC-2026-0101" -> "001". Shown as "Order No. 005". The full order number stays the real id (payment links,
 * webhook, status checks); this is only for showing. Anything that doesn't look like an order number is shown as it is.
 */
export function ticketNumber(orderNumber: string) {
  const counter = Number(/(\d+)$/.exec(orderNumber)?.[1])
  if (!Number.isInteger(counter) || counter < 1) return orderNumber
  const ticket = ((counter - 1) % TICKET_NUMBER_MAX) + 1
  return String(ticket).padStart(3, '0')
}

export function isFulfillmentStatus(value: unknown): value is FulfillmentStatus {
  return typeof value === 'string' && (fulfillmentStatuses as readonly string[]).includes(value)
}
