-- ============================================================================
-- CHUNK 4: Order deliveries, analytics, gig analytics, user roles
-- (migrations 0016, 0018–0021)
-- ============================================================================

-- 0016: ORDER DELIVERIES
create table if not exists public.order_deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  message text default '',
  files jsonb default '[]',
  created_at timestamptz default now()
);

create index if not exists order_deliveries_order on public.order_deliveries(order_id);

alter table public.order_deliveries enable row level security;

drop policy if exists "Order participants can read deliveries" on public.order_deliveries;
create policy "Order participants can read deliveries"
  on public.order_deliveries for select using (
    auth.uid() in (
      select buyer_id from public.orders where orders.id = order_deliveries.order_id
      union
      select seller_id from public.orders where orders.id = order_deliveries.order_id
    )
  );

drop policy if exists "Sellers can insert deliveries" on public.order_deliveries;
create policy "Sellers can insert deliveries"
  on public.order_deliveries for insert with check (auth.uid() = seller_id);

-- Deliveries storage bucket
insert into storage.buckets (id, name, public)
values ('deliveries', 'deliveries', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload delivery files" on storage.objects;
create policy "Authenticated users can upload delivery files"
  on storage.objects for insert
  with check (bucket_id = 'deliveries' and auth.role() = 'authenticated');

drop policy if exists "Anyone can read delivery files" on storage.objects;
create policy "Anyone can read delivery files"
  on storage.objects for select
  using (bucket_id = 'deliveries');

-- 0018: PAGE VIEWS + ACTIVE SESSIONS
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  visitor_id text not null,
  path text not null default '/',
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists idx_page_views_created on public.page_views (created_at desc);
create index if not exists idx_page_views_visitor on public.page_views (visitor_id, created_at desc);

create table if not exists public.active_sessions (
  id text primary key,
  user_id uuid references auth.users(id),
  last_seen timestamptz not null default now(),
  path text
);

create index if not exists idx_active_sessions_seen on public.active_sessions (last_seen desc);

alter table public.page_views enable row level security;

drop policy if exists "Anyone can insert page views" on public.page_views;
create policy "Anyone can insert page views" on public.page_views for insert with check (true);

alter table public.active_sessions enable row level security;

drop policy if exists "Anyone can upsert sessions" on public.active_sessions;
create policy "Anyone can upsert sessions" on public.active_sessions for all using (true) with check (true);

create or replace function public.cleanup_stale_sessions()
returns void language sql security definer as $$
  delete from public.active_sessions where last_seen < now() - interval '5 minutes';
$$;

create or replace function public.get_analytics_summary()
returns json language plpgsql security definer as $$
declare
  result json;
begin
  perform public.cleanup_stale_sessions();
  select json_build_object(
    'online_now', (select count(*) from public.active_sessions where last_seen > now() - interval '2 minutes'),
    'today', (select count(distinct visitor_id) from public.page_views where created_at >= date_trunc('day', now())),
    'this_week', (select count(distinct visitor_id) from public.page_views where created_at >= date_trunc('week', now())),
    'this_month', (select count(distinct visitor_id) from public.page_views where created_at >= date_trunc('month', now())),
    'total_views_today', (select count(*) from public.page_views where created_at >= date_trunc('day', now())),
    'total_views_month', (select count(*) from public.page_views where created_at >= date_trunc('month', now()))
  ) into result;
  return result;
end;
$$;

-- 0019: ADVANCED ANALYTICS
alter table public.page_views add column if not exists device text;
alter table public.page_views add column if not exists browser text;
alter table public.page_views add column if not exists country text;
alter table public.page_views add column if not exists user_id uuid references auth.users(id);

alter table public.active_sessions add column if not exists device text;
alter table public.active_sessions add column if not exists country text;

create index if not exists idx_page_views_country on public.page_views (country);
create index if not exists idx_page_views_path on public.page_views (path);

create or replace function public.get_top_pages(p_since timestamptz default date_trunc('month', now()))
returns json language sql security definer stable as $$
  select coalesce(json_agg(row_to_json(t)), '[]')
  from (
    select path, count(*) as views, count(distinct visitor_id) as visitors
    from public.page_views
    where created_at >= p_since
    group by path
    order by views desc
    limit 15
  ) t;
$$;

create or replace function public.get_hourly_traffic()
returns json language sql security definer stable as $$
  select coalesce(json_agg(row_to_json(t) order by t.hour), '[]')
  from (
    select extract(hour from created_at)::int as hour, count(*) as views
    from public.page_views
    where created_at >= now() - interval '24 hours'
    group by hour
  ) t;
$$;

create or replace function public.get_daily_visitors()
returns json language sql security definer stable as $$
  select coalesce(json_agg(row_to_json(t) order by t.day), '[]')
  from (
    select created_at::date as day,
           count(distinct visitor_id) as visitors,
           count(*) as views
    from public.page_views
    where created_at >= now() - interval '30 days'
    group by day
  ) t;
$$;

create or replace function public.get_device_stats(p_since timestamptz default date_trunc('month', now()))
returns json language sql security definer stable as $$
  select coalesce(json_agg(row_to_json(t)), '[]')
  from (
    select coalesce(device, 'Unknown') as device, count(*) as views
    from public.page_views
    where created_at >= p_since
    group by device
    order by views desc
  ) t;
$$;

create or replace function public.get_browser_stats(p_since timestamptz default date_trunc('month', now()))
returns json language sql security definer stable as $$
  select coalesce(json_agg(row_to_json(t)), '[]')
  from (
    select coalesce(browser, 'Unknown') as browser, count(*) as views
    from public.page_views
    where created_at >= p_since
    group by browser
    order by views desc
    limit 10
  ) t;
$$;

create or replace function public.get_country_stats(p_since timestamptz default date_trunc('month', now()))
returns json language sql security definer stable as $$
  select coalesce(json_agg(row_to_json(t)), '[]')
  from (
    select coalesce(country, 'Unknown') as country, count(*) as views, count(distinct visitor_id) as visitors
    from public.page_views
    where created_at >= p_since
    group by country
    order by views desc
    limit 20
  ) t;
$$;

create or replace function public.get_referrer_stats(p_since timestamptz default date_trunc('month', now()))
returns json language sql security definer stable as $$
  select coalesce(json_agg(row_to_json(t)), '[]')
  from (
    select
      case
        when referrer is null or referrer = '' then 'Direct'
        when referrer ilike '%google%' then 'Google'
        when referrer ilike '%facebook%' or referrer ilike '%fb.%' then 'Facebook'
        when referrer ilike '%twitter%' or referrer ilike '%t.co%' then 'Twitter/X'
        when referrer ilike '%instagram%' then 'Instagram'
        when referrer ilike '%linkedin%' then 'LinkedIn'
        when referrer ilike '%youtube%' then 'YouTube'
        when referrer ilike '%tiktok%' then 'TikTok'
        when referrer ilike '%reddit%' then 'Reddit'
        else split_part(split_part(referrer, '://', 2), '/', 1)
      end as source,
      count(*) as views
    from public.page_views
    where created_at >= p_since
    group by source
    order by views desc
    limit 10
  ) t;
$$;

create or replace function public.get_live_visitors()
returns json language sql security definer as $$
  select coalesce(json_agg(row_to_json(t) order by t.last_seen desc), '[]')
  from (
    select id, path, device, country, last_seen,
           user_id is not null as logged_in
    from public.active_sessions
    where last_seen > now() - interval '2 minutes'
    limit 50
  ) t;
$$;

-- Enhanced summary (replaces original)
create or replace function public.get_analytics_summary()
returns json language plpgsql security definer as $$
declare
  result json;
begin
  perform public.cleanup_stale_sessions();
  select json_build_object(
    'online_now', (select count(*) from public.active_sessions where last_seen > now() - interval '2 minutes'),
    'online_logged_in', (select count(*) from public.active_sessions where last_seen > now() - interval '2 minutes' and user_id is not null),
    'today', (select count(distinct visitor_id) from public.page_views where created_at >= date_trunc('day', now())),
    'yesterday', (select count(distinct visitor_id) from public.page_views where created_at >= date_trunc('day', now()) - interval '1 day' and created_at < date_trunc('day', now())),
    'this_week', (select count(distinct visitor_id) from public.page_views where created_at >= date_trunc('week', now())),
    'this_month', (select count(distinct visitor_id) from public.page_views where created_at >= date_trunc('month', now())),
    'total_views_today', (select count(*) from public.page_views where created_at >= date_trunc('day', now())),
    'total_views_month', (select count(*) from public.page_views where created_at >= date_trunc('month', now())),
    'total_all_time', (select count(distinct visitor_id) from public.page_views)
  ) into result;
  return result;
end;
$$;

-- 0020: GIG DAILY STATS + custom orders toggle
create table if not exists public.gig_daily_stats (
  gig_id uuid not null references public.gigs(id) on delete cascade,
  stat_date date not null default current_date,
  impressions int not null default 0,
  clicks int not null default 0,
  primary key (gig_id, stat_date)
);

create index if not exists idx_gig_daily_stats_date on public.gig_daily_stats (stat_date desc);
create index if not exists idx_gig_daily_stats_gig on public.gig_daily_stats (gig_id, stat_date desc);

alter table public.gig_daily_stats enable row level security;

drop policy if exists "gig_stats_select" on public.gig_daily_stats;
create policy "gig_stats_select" on public.gig_daily_stats for select using (true);

drop policy if exists "gig_stats_insert" on public.gig_daily_stats;
create policy "gig_stats_insert" on public.gig_daily_stats for insert with check (true);

drop policy if exists "gig_stats_update" on public.gig_daily_stats;
create policy "gig_stats_update" on public.gig_daily_stats for update using (true);

alter table public.gigs add column if not exists custom_orders boolean not null default true;

create or replace function public.record_gig_impressions(gig_ids uuid[])
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into gig_daily_stats (gig_id, stat_date, impressions, clicks)
  select unnest(gig_ids), current_date, 1, 0
  on conflict (gig_id, stat_date)
  do update set impressions = gig_daily_stats.impressions + 1;
end;
$$;
grant execute on function public.record_gig_impressions(uuid[]) to anon, authenticated;

create or replace function public.record_gig_click(gig uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into gig_daily_stats (gig_id, stat_date, impressions, clicks)
  values (gig, current_date, 0, 1)
  on conflict (gig_id, stat_date)
  do update set clicks = gig_daily_stats.clicks + 1;
end;
$$;
grant execute on function public.record_gig_click(uuid) to anon, authenticated;

create or replace function public.get_seller_gig_analytics(
  p_seller uuid,
  p_since date default current_date - 30,
  p_until date default current_date
)
returns json language sql security definer stable set search_path = public as $$
  select coalesce(json_agg(row_to_json(t)), '[]')
  from (
    select
      g.id as gig_id,
      coalesce(sum(s.impressions), 0)::int as impressions,
      coalesce(sum(s.clicks), 0)::int as clicks,
      (select count(*)::int from orders o
       where o.gig_id = g.id
         and o.created_at::date between p_since and p_until) as orders,
      (select count(*)::int from orders o
       where o.gig_id = g.id and o.status = 'cancelled'
         and o.created_at::date between p_since and p_until) as cancellations
    from gigs g
    left join gig_daily_stats s
      on s.gig_id = g.id
      and s.stat_date between p_since and p_until
    where g.seller_id = p_seller
    group by g.id
  ) t;
$$;
grant execute on function public.get_seller_gig_analytics(uuid, date, date) to authenticated;

-- 0021: USER ROLES
alter table public.profiles
  add column if not exists role text check (role in ('freelancer', 'buyer', 'both'));

alter table public.profiles
  add column if not exists buyer_profile jsonb not null default '{}';

create index if not exists profiles_role_idx on public.profiles (role);

-- Add display_name column for SEO sitemap
alter table public.profiles
  add column if not exists display_name text;

-- Gig rating/reviews denormalized columns (used by SEO layout)
alter table public.gigs add column if not exists rating numeric;
alter table public.gigs add column if not exists reviews integer default 0;
