-- Run this once in the Supabase SQL editor to enable the staff order dashboard.
-- Tracks the kitchen side of an order separately from payment `status`:
--   new -> preparing -> ready (for collection) -> collected

alter table orders
  add column if not exists fulfillment_status text not null default 'new',
  add column if not exists preparing_at timestamptz,
  add column if not exists ready_at timestamptz,
  add column if not exists collected_at timestamptz;

alter table orders drop constraint if exists orders_fulfillment_status_check;
alter table orders
  add constraint orders_fulfillment_status_check
  check (fulfillment_status in ('new', 'preparing', 'ready', 'collected'));

create index if not exists orders_fulfillment_idx on orders (status, fulfillment_status, created_at);
