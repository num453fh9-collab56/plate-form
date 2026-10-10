-- Phase M3: dispute center + automatic seller levels.

-- ---------- DISPUTES ----------
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

-- ---------- SELLER LEVELS ----------
-- new -> level_1 -> level_2 -> top_rated, computed live
-- from completed orders, rating, on-time delivery, age.
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
