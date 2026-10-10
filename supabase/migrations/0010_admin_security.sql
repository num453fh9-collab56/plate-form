-- Phase S1: admin role, bans, error logs, rate limiting.
-- Lines are kept short so the SQL survives copy/paste.

-- ADMINS: rows are added by hand in the SQL editor only
-- (no insert/update policy, so nobody can make themselves admin).
create table if not exists public.admins (
  user_id uuid primary key
    references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "admins_select_own" on public.admins;
create policy "admins_select_own" on public.admins
  for select using (auth.uid() = user_id);

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a where a.user_id = uid
  );
$$;

-- BANNED USERS: written by the admin API (service role).
create table if not exists public.banned_users (
  user_id uuid primary key
    references auth.users(id) on delete cascade,
  reason text,
  banned_by uuid,
  created_at timestamptz not null default now()
);

alter table public.banned_users enable row level security;

-- ERROR LOGS: written by /api/log-error and the server
-- instrumentation hook; read through the admin API.
create table if not exists public.error_logs (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  source text not null default 'client',
  message text not null,
  digest text,
  path text,
  user_id uuid,
  user_agent text,
  context jsonb not null default '{}'
);

create index if not exists error_logs_created_idx
  on public.error_logs (created_at desc);

alter table public.error_logs enable row level security;

-- RATE LIMITS: fixed-window counters shared by every
-- server instance (works on Vercel serverless).
create table if not exists public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  hits integer not null default 0
);

alter table public.rate_limits enable row level security;

create or replace function public.check_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_hits integer;
begin
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update
    set hits = case
          when r.window_start
               < now() - make_interval(secs => p_window_seconds)
          then 1
          else r.hits + 1
        end,
        window_start = case
          when r.window_start
               < now() - make_interval(secs => p_window_seconds)
          then now()
          else r.window_start
        end
  returning hits into current_hits;
  -- occasional cleanup so the table never grows unbounded
  if random() < 0.01 then
    delete from public.rate_limits
    where window_start < now() - interval '1 day';
  end if;
  return current_hits <= p_max;
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer)
  to service_role;
