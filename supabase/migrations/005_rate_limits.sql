-- Run this once in the Supabase SQL editor to switch on rate limiting (e.g. max checkouts per visitor).
-- Used by lib/rate-limit.ts. Until this is run, the site still works, it just doesn't limit anything.

create table if not exists rate_limits (
  -- What is being counted, e.g. "checkout:ip:<hashed address>". Never a raw IP address.
  key text primary key,
  -- How many times it happened in the current window.
  count integer not null default 0,
  -- When the current window started.
  window_start timestamptz not null default now()
);

-- RLS on, no policies: only the service role key (used server-side) can read/write.
alter table rate_limits enable row level security;

-- Counts one attempt for `p_key` and returns true if it is still within `p_limit` attempts
-- per `p_window_seconds`. Done in a single statement, so many requests at the same moment
-- can't all slip through by reading the old count.
create or replace function hit_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
begin
  insert into rate_limits as r (key, count, window_start)
  values (p_key, 1, now())
  on conflict (key) do update
    set count = case
          when r.window_start < now() - make_interval(secs => p_window_seconds) then 1
          else r.count + 1
        end,
        window_start = case
          when r.window_start < now() - make_interval(secs => p_window_seconds) then now()
          else r.window_start
        end
  returning count into current_count;

  -- Now and then, tidy up old rows so the table stays small.
  if random() < 0.01 then
    delete from rate_limits where window_start < now() - interval '1 day';
  end if;

  return current_count <= p_limit;
end;
$$;

-- Only the server (service role) may call it.
revoke all on function hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function hit_rate_limit(text, integer, integer) to service_role;
