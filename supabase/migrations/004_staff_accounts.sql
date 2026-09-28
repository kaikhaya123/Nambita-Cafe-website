-- Run this once in the Supabase SQL editor to enable personal dashboard logins
-- (own password + authenticator app) for staff and managers.

create table if not exists staff_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  role text not null check (role in ('staff', 'manager')),
  is_active boolean not null default true,

  -- scrypt hash of the person's own password; null until they finish setup.
  password_hash text,
  -- Base32 authenticator (TOTP) secret; null until they finish setup.
  totp_secret text,
  -- Last authenticator time-step accepted, so a code can't be used twice.
  last_totp_step bigint,

  -- One-time setup code issued by a manager (SHA-256 hash only).
  setup_code_hash text,
  setup_code_expires_at timestamptz,

  -- Lockout after repeated wrong passwords / codes.
  failed_attempts integer not null default 0,
  locked_until timestamptz,

  -- Bumped on reset or deactivation so existing logins stop working.
  session_version integer not null default 1,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists staff_accounts_set_updated_at on staff_accounts;
create trigger staff_accounts_set_updated_at
  before update on staff_accounts
  for each row
  execute function set_updated_at();

-- RLS on, no policies: only the service role key (used server-side) can read/write.
alter table staff_accounts enable row level security;

-- Current staff. They can't log in until a manager gives them a setup code.
insert into staff_accounts (name, role) values
  ('Wendy Ngubane', 'staff'),
  ('Sinothando', 'staff'),
  ('Nolwazi Nzama', 'staff')
on conflict (name) do nothing;
