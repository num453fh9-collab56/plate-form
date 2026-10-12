-- Advanced analytics: device, browser, country tracking + richer queries

-- Add columns to page_views
alter table page_views add column if not exists device text;
alter table page_views add column if not exists browser text;
alter table page_views add column if not exists country text;
alter table page_views add column if not exists user_id uuid references auth.users(id);

-- Add device info to active_sessions
alter table active_sessions add column if not exists device text;
alter table active_sessions add column if not exists country text;

-- Index for country/device grouping
create index if not exists idx_page_views_country on page_views (country);
create index if not exists idx_page_views_path on page_views (path);

-- Top pages for a given period
create or replace function get_top_pages(p_since timestamptz default date_trunc('month', now()))
returns json language sql security definer stable as $$
  select coalesce(json_agg(row_to_json(t)), '[]')
  from (
    select path, count(*) as views, count(distinct visitor_id) as visitors
    from page_views
    where created_at >= p_since
    group by path
    order by views desc
    limit 15
  ) t;
$$;

-- Traffic by hour (last 24h)
create or replace function get_hourly_traffic()
returns json language sql security definer stable as $$
  select coalesce(json_agg(row_to_json(t) order by t.hour), '[]')
  from (
    select extract(hour from created_at)::int as hour, count(*) as views
    from page_views
    where created_at >= now() - interval '24 hours'
    group by hour
  ) t;
$$;

-- Daily visitors for the last 30 days
create or replace function get_daily_visitors()
returns json language sql security definer stable as $$
  select coalesce(json_agg(row_to_json(t) order by t.day), '[]')
  from (
    select created_at::date as day,
           count(distinct visitor_id) as visitors,
           count(*) as views
    from page_views
    where created_at >= now() - interval '30 days'
    group by day
  ) t;
$$;

-- Device breakdown
create or replace function get_device_stats(p_since timestamptz default date_trunc('month', now()))
returns json language sql security definer stable as $$
  select coalesce(json_agg(row_to_json(t)), '[]')
  from (
    select coalesce(device, 'Unknown') as device, count(*) as views
    from page_views
    where created_at >= p_since
    group by device
    order by views desc
  ) t;
$$;

-- Browser breakdown
create or replace function get_browser_stats(p_since timestamptz default date_trunc('month', now()))
returns json language sql security definer stable as $$
  select coalesce(json_agg(row_to_json(t)), '[]')
  from (
    select coalesce(browser, 'Unknown') as browser, count(*) as views
    from page_views
    where created_at >= p_since
    group by browser
    order by views desc
    limit 10
  ) t;
$$;

-- Country breakdown
create or replace function get_country_stats(p_since timestamptz default date_trunc('month', now()))
returns json language sql security definer stable as $$
  select coalesce(json_agg(row_to_json(t)), '[]')
  from (
    select coalesce(country, 'Unknown') as country, count(*) as views, count(distinct visitor_id) as visitors
    from page_views
    where created_at >= p_since
    group by country
    order by views desc
    limit 20
  ) t;
$$;

-- Referrer breakdown
create or replace function get_referrer_stats(p_since timestamptz default date_trunc('month', now()))
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
    from page_views
    where created_at >= p_since
    group by source
    order by views desc
    limit 10
  ) t;
$$;

-- Live visitors with details
create or replace function get_live_visitors()
returns json language sql security definer as $$
  select coalesce(json_agg(row_to_json(t) order by t.last_seen desc), '[]')
  from (
    select id, path, device, country, last_seen,
           user_id is not null as logged_in
    from active_sessions
    where last_seen > now() - interval '2 minutes'
    limit 50
  ) t;
$$;

-- Enhanced summary (replaces original)
create or replace function get_analytics_summary()
returns json language plpgsql security definer as $$
declare
  result json;
begin
  perform cleanup_stale_sessions();

  select json_build_object(
    'online_now', (select count(*) from active_sessions where last_seen > now() - interval '2 minutes'),
    'online_logged_in', (select count(*) from active_sessions where last_seen > now() - interval '2 minutes' and user_id is not null),
    'today', (select count(distinct visitor_id) from page_views where created_at >= date_trunc('day', now())),
    'yesterday', (select count(distinct visitor_id) from page_views where created_at >= date_trunc('day', now()) - interval '1 day' and created_at < date_trunc('day', now())),
    'this_week', (select count(distinct visitor_id) from page_views where created_at >= date_trunc('week', now())),
    'this_month', (select count(distinct visitor_id) from page_views where created_at >= date_trunc('month', now())),
    'total_views_today', (select count(*) from page_views where created_at >= date_trunc('day', now())),
    'total_views_month', (select count(*) from page_views where created_at >= date_trunc('month', now())),
    'total_all_time', (select count(distinct visitor_id) from page_views)
  ) into result;

  return result;
end;
$$;
