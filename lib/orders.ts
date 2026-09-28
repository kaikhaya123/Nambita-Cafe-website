// Order types and the kitchen stages (new -> preparing -> ready -> collected) used by the dashboard and APIs.

import type { OrderLine } from '@/lib/menu-data'

export const fulfillmentStatuses = ['new', 'preparing', 'ready', 'collected'] as const
export type FulfillmentStatus = (typeof fulfillmentStatuses)[number]

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

export function isFulfillmentStatus(value: unknown): value is FulfillmentStatus {
  return typeof value === 'string' && (fulfillmentStatuses as readonly string[]).includes(value)
}
