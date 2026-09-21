-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

create sequence if not exists orders_order_seq;

create or replace function generate_order_number() returns text as $$
  select 'NC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('orders_order_seq')::text, 4, '0');
$$ language sql;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default generate_order_number(),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),

  customer_first_name text not null,
  customer_last_name text not null,
  customer_phone text not null,
  customer_email text,
  pickup_location_id text not null,
  pickup_location_name text not null,
  notes text,

  items jsonb not null,
  subtotal numeric(10, 2) not null,
  total numeric(10, 2) not null,

  yoco_checkout_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_order_number_idx on orders (order_number);
create index if not exists orders_status_idx on orders (status);

-- Keep updated_at current on every update.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at
  before update on orders
  for each row
  execute function set_updated_at();

-- RLS on, no policies: only the service role key (used server-side) can read/write.
alter table orders enable row level security;
