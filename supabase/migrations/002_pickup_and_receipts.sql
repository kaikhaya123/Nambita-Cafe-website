-- Run this once in the Supabase SQL editor for an existing project that was
-- created from the pre-pickup version of orders.sql (delivery-based orders).
-- Safe to skip if you're setting up a fresh project from orders.sql directly.

create sequence if not exists orders_order_seq;

create or replace function generate_order_number() returns text as $$
  select 'NC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('orders_order_seq')::text, 4, '0');
$$ language sql;

alter table orders
  drop column if exists delivery_address,
  drop column if exists delivery_fee,
  add column if not exists pickup_location_id text not null default '',
  add column if not exists pickup_location_name text not null default '',
  alter column order_number set default generate_order_number();

-- Drop the temporary defaults once you're happy every row has real pickup data.
-- alter table orders alter column pickup_location_id drop default;
-- alter table orders alter column pickup_location_name drop default;
