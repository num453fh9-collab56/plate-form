-- Per-gig daily analytics (impressions, clicks) and custom-order toggle

-- Daily aggregated stats per gig
create table if not exists public.gig_daily_stats (
  gig_id    uuid not null references public.gigs(id) on delete cascade,
  stat_date date not null default current_date,
  impressions int not null default 0,
  clicks      int not null default 0,
  primary key (gig_id, stat_date)
);

create index if not exists idx_gig_daily_stats_date on public.gig_daily_stats (stat_date desc);
create index if not exists idx_gig_daily_stats_gig  on public.gig_daily_stats (gig_id, stat_date desc);

alter table public.gig_daily_stats enable row level security;

-- Anyone can insert/update (tracking is anonymous)
create policy "gig_stats_select" on public.gig_daily_stats for select using (true);
create policy "gig_stats_insert" on public.gig_daily_stats for insert with check (true);
create policy "gig_stats_update" on public.gig_daily_stats for update using (true);

-- Custom orders toggle on gigs
alter table public.gigs add column if not exists custom_orders boolean not null default true;

-- Batch-record impressions for multiple gigs at once (search/browse)
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

-- Record a single click (gig page visit)
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

-- Get per-gig analytics for a seller in a date range
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
