-- ============================================================================
-- CHUNK 3: Admin, marketplace pro, buyer requests, disputes, profile protection
-- (migrations 0010–0014)
-- ============================================================================

-- 0010: ADMINS
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

-- BANNED USERS
create table if not exists public.banned_users (
  user_id uuid primary key
    references auth.users(id) on delete cascade,
  reason text,
  banned_by uuid,
  created_at timestamptz not null default now()
);

alter table public.banned_users enable row level security;

-- ERROR LOGS
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

-- RATE LIMITS
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

-- 0011: ORDERS extra columns + MESSAGES kind/meta + OFFERS + MILESTONES
alter table public.orders
  add column if not exists paid_at timestamptz;
alter table public.orders
  add column if not exists offer_id uuid;
alter table public.orders
  add column if not exists proposal_id uuid;
alter table public.orders
  add column if not exists title text;

alter table public.messages
  add column if not exists kind text not null default 'text';
alter table public.messages
  add column if not exists meta jsonb not null default '{}';

drop policy if exists "messages_insert_participant"
  on public.messages;
create policy "messages_insert_participant"
  on public.messages
  for insert with check (
    auth.uid() = sender_id
    and kind in ('text', 'call')
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid()
             or c.seller_id = auth.uid())
    )
  );

-- CUSTOM OFFERS
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null
    references public.conversations(id) on delete cascade,
  seller_id uuid not null
    references auth.users(id) on delete cascade,
  buyer_id uuid not null
    references auth.users(id) on delete cascade,
  gig_id uuid
    references public.gigs(id) on delete set null,
  title text not null,
  description text not null default '',
  amount numeric not null,
  delivery_days integer not null default 1,
  revisions integer not null default 0,
  milestones jsonb not null default '[]',
  status text not null default 'pending',
  expires_at timestamptz,
  order_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists offers_conversation_idx
  on public.offers (conversation_id, created_at desc);

alter table public.offers enable row level security;

drop policy if exists "offers_select_participant"
  on public.offers;
create policy "offers_select_participant"
  on public.offers
  for select using (
    auth.uid() = seller_id or auth.uid() = buyer_id
  );

-- ORDER MILESTONES
create table if not exists public.order_milestones (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null
    references public.orders(id) on delete cascade,
  position integer not null default 0,
  title text not null,
  amount numeric not null,
  days integer not null default 1,
  status text not null default 'pending',
  delivery_note text,
  delivered_at timestamptz,
  approved_at timestamptz,
  payout_status text,
  created_at timestamptz not null default now()
);

create index if not exists order_milestones_order_idx
  on public.order_milestones (order_id, position);

alter table public.order_milestones
  enable row level security;

drop policy if exists "milestones_select_participant"
  on public.order_milestones;
create policy "milestones_select_participant"
  on public.order_milestones
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.buyer_id = auth.uid()
             or o.seller_id = auth.uid())
    )
  );

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and tablename = 'offers'
  ) then
    alter publication supabase_realtime
      add table public.offers;
  end if;
end $$;

-- 0012: BUYER REQUESTS (job posts) + PROPOSALS
create table if not exists public.job_posts (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null
    references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  category text,
  skills text[] not null default '{}',
  budget_min numeric,
  budget_max numeric,
  delivery_days integer,
  status text not null default 'open',
  proposals_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_posts_status_idx
  on public.job_posts (status, created_at desc);
create index if not exists job_posts_buyer_idx
  on public.job_posts (buyer_id, created_at desc);

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null
    references public.job_posts(id) on delete cascade,
  seller_id uuid not null
    references auth.users(id) on delete cascade,
  cover_letter text not null default '',
  amount numeric not null,
  delivery_days integer not null default 1,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (job_id, seller_id)
);

create index if not exists proposals_job_idx
  on public.proposals (job_id, created_at desc);
create index if not exists proposals_seller_idx
  on public.proposals (seller_id, created_at desc);

create or replace function public.has_proposal(job uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.proposals p
    where p.job_id = job and p.seller_id = auth.uid()
  );
$$;

create or replace function public.owns_job(job uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.job_posts j
    where j.id = job and j.buyer_id = auth.uid()
  );
$$;

alter table public.job_posts enable row level security;
alter table public.proposals enable row level security;

drop policy if exists "jobs_select" on public.job_posts;
create policy "jobs_select" on public.job_posts
  for select using (
    status = 'open'
    or buyer_id = auth.uid()
    or public.has_proposal(id)
  );

drop policy if exists "proposals_select" on public.proposals;
create policy "proposals_select" on public.proposals
  for select using (
    seller_id = auth.uid()
    or public.owns_job(job_id)
  );

create or replace function public.sync_proposals_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
begin
  target := coalesce(new.job_id, old.job_id);
  update public.job_posts
  set proposals_count = (
    select count(*) from public.proposals p
    where p.job_id = target
  )
  where id = target;
  return null;
end;
$$;

drop trigger if exists trg_proposals_count
  on public.proposals;
create trigger trg_proposals_count
  after insert or delete on public.proposals
  for each row execute function public.sync_proposals_count();

drop trigger if exists trg_job_posts_updated
  on public.job_posts;
create trigger trg_job_posts_updated
  before update on public.job_posts
  for each row execute function public.set_updated_at();

-- 0013: DISPUTES + SELLER LEVELS
create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null
    references public.orders(id) on delete cascade,
  opened_by uuid not null
    references auth.users(id) on delete cascade,
  reason text not null,
  details text not null default '',
  previous_status text,
  status text not null default 'open',
  resolution text,
  refund_amount numeric,
  admin_note text,
  resolved_by uuid,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create unique index if not exists disputes_one_open
  on public.disputes (order_id)
  where status = 'open';

create table if not exists public.dispute_messages (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid not null
    references public.disputes(id) on delete cascade,
  sender_id uuid not null,
  body text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists dispute_messages_idx
  on public.dispute_messages (dispute_id, created_at);

alter table public.disputes enable row level security;
alter table public.dispute_messages
  enable row level security;

drop policy if exists "disputes_select_participant"
  on public.disputes;
create policy "disputes_select_participant"
  on public.disputes
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.buyer_id = auth.uid()
             or o.seller_id = auth.uid())
    )
  );

drop policy if exists "dispute_messages_select"
  on public.dispute_messages;
create policy "dispute_messages_select"
  on public.dispute_messages
  for select using (
    exists (
      select 1
      from public.disputes d
      join public.orders o on o.id = d.order_id
      where d.id = dispute_id
        and (o.buyer_id = auth.uid()
             or o.seller_id = auth.uid())
    )
  );

-- SELLER LEVELS function
create or replace function public.seller_stats(uids uuid[])
returns table (
  seller_id uuid,
  completed integer,
  rating numeric,
  reviews integer,
  on_time integer,
  member_since timestamptz,
  level text
)
language sql
stable
security definer
set search_path = public
as $$
  with o as (
    select
      seller_id,
      count(*) filter (
        where status = 'completed') as done,
      count(*) filter (
        where delivered_at is not null
          and paid_at is not null) as delivered_n,
      count(*) filter (
        where delivered_at is not null
          and paid_at is not null
          and delivered_at <= paid_at
            + make_interval(days => coalesce(delivery_days, 1))
      ) as on_time_n
    from public.orders
    where seller_id = any(uids)
    group by seller_id
  ),
  r as (
    select seller_id, avg(rating) as avg_rating,
      count(*) as n
    from public.reviews
    where seller_id = any(uids)
    group by seller_id
  ),
  s as (
    select
      u.id,
      u.created_at,
      coalesce(o.done, 0) as done,
      coalesce(r.avg_rating, 0) as avg_rating,
      coalesce(r.n, 0) as n,
      case when coalesce(o.delivered_n, 0) = 0 then null
        else round(o.on_time_n * 100.0 / o.delivered_n)
      end as pct
    from auth.users u
    left join o on o.seller_id = u.id
    left join r on r.seller_id = u.id
    where u.id = any(uids)
  )
  select
    s.id,
    s.done::integer,
    round(s.avg_rating, 2),
    s.n::integer,
    s.pct::integer,
    s.created_at,
    case
      when s.done >= 100 and s.avg_rating >= 4.8
        and s.created_at < now() - interval '180 days'
        and coalesce(s.pct, 100) >= 90 then 'top_rated'
      when s.done >= 50 and s.avg_rating >= 4.6
        and s.created_at < now() - interval '120 days'
        and coalesce(s.pct, 100) >= 85 then 'level_2'
      when s.done >= 10 and s.avg_rating >= 4.4
        and s.created_at < now() - interval '60 days'
        then 'level_1'
      else 'new'
    end
  from s;
$$;

grant execute on function public.seller_stats(uuid[])
  to anon, authenticated;

-- 0014: PROFILE PROTECTION (trust fields)
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.role() in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.id_verified := false;
      new.payment_verified := false;
      new.stripe_account_id := null;
    else
      new.id_verified := old.id_verified;
      new.payment_verified := old.payment_verified;
      new.stripe_account_id := old.stripe_account_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_protect
  on public.profiles;

create trigger trg_profiles_protect
  before insert or update on public.profiles
  for each row
  execute function public.protect_profile_columns();
