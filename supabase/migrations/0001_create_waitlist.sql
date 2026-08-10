-- Topline waitlist — stores emails captured on /topline.
-- Namespaced (topline_) so it's safe to add to a shared Supabase project.
-- Safe to run multiple times.

create table if not exists public.topline_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text,
  created_at timestamptz not null default now()
);

-- Row Level Security ON. The public "anon" key can ONLY do what the policies
-- below permit — it cannot read this table or touch anything else in the
-- project. This is what makes it safe to reuse an existing project's anon key.
alter table public.topline_waitlist enable row level security;

-- Allow anonymous inserts (the public waitlist form). No SELECT/UPDATE/DELETE
-- policy exists, so the anon key can add a row but never read the list back.
drop policy if exists "anon can join waitlist" on public.topline_waitlist;
create policy "anon can join waitlist"
  on public.topline_waitlist
  for insert
  to anon
  with check (true);
