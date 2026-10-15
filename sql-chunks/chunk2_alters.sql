-- ============================================================================
-- CHUNK 2: Order delivery, payouts, notifications, gig fields, profile fields
-- (migrations 0002–0009)
-- ============================================================================

-- 0002: delivery/revision flow
alter table public.orders add column if not exists delivery_note text;
alter table public.orders add column if not exists revision_note text;
alter table public.orders add column if not exists revision_count int not null default 0;
alter table public.orders add column if not exists delivered_at timestamptz;

-- 0003: Stripe Connect payouts
alter table public.profiles add column if not exists stripe_account_id text;

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  seller_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null default 0,
  currency text not null default 'usd',
  status text not null default 'pending',
  stripe_transfer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payouts_seller_idx on public.payouts (seller_id, created_at desc);

alter table public.payouts enable row level security;

drop policy if exists "payouts_select_seller" on public.payouts;
create policy "payouts_select_seller" on public.payouts
  for select using (auth.uid() = seller_id);

drop trigger if exists trg_payouts_updated on public.payouts;
create trigger trg_payouts_updated before update on public.payouts
  for each row execute function public.set_updated_at();

-- 0004: notifications (merged with 0017 — includes data column + unread index)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'info',
  title text not null,
  body text default '',
  link text default '',
  read boolean not null default false,
  data jsonb default '{}',
  created_at timestamptz not null default now()
);

alter table public.notifications add column if not exists data jsonb default '{}';

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread on public.notifications (user_id) where read = false;

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "notifications_update_own" on public.notifications;
drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

-- 0005: gig images + packages
alter table public.gigs add column if not exists images text[] not null default '{}';
alter table public.gigs add column if not exists packages jsonb;

-- 0006: gig requirements, faq, extras
alter table public.gigs add column if not exists requirements text;
alter table public.gigs add column if not exists faq jsonb not null default '[]';
alter table public.gigs add column if not exists extras jsonb not null default '[]';

-- 0007: richer profile skills
alter table public.profiles add column if not exists skill_levels jsonb not null default '{}';
alter table public.profiles add column if not exists experience_years numeric;
alter table public.profiles add column if not exists weekly_hours text;
alter table public.profiles add column if not exists response_time text;

-- 0008: social links + portfolio ordering
alter table public.profiles add column if not exists social_links jsonb not null default '{}';
alter table public.portfolio_projects add column if not exists position integer not null default 0;

-- 0009: gig advanced — drafts/pause, search tags, views, order packages
alter table public.gigs add column if not exists status text not null default 'published';
alter table public.gigs add column if not exists tags text[] not null default '{}';
alter table public.gigs add column if not exists requirement_questions jsonb not null default '[]';
alter table public.gigs add column if not exists views integer not null default 0;

create index if not exists gigs_status_idx on public.gigs (status, created_at desc);

drop policy if exists "gigs_select_all" on public.gigs;
create policy "gigs_select_all" on public.gigs
  for select using (status = 'published' or auth.uid() = seller_id);

alter table public.orders add column if not exists package_key text;
alter table public.orders add column if not exists extras jsonb not null default '[]';

create or replace function public.increment_gig_views(gig uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.gigs set views = views + 1 where id = gig and status = 'published';
$$;
grant execute on function public.increment_gig_views(uuid) to anon, authenticated;
