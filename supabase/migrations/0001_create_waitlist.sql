-- Topline waitlist — stores emails captured on /topline.
-- Safe to run multiple times.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text,
  created_at timestamptz not null default now()
);

-- Row Level Security on, with NO public policies: only the service_role key
-- (used by our server-side API route) can read or write. The anon/public key
-- cannot touch this table.
alter table public.waitlist enable row level security;
