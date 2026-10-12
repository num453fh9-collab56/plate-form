-- Track page views and online presence for analytics

create table if not exists page_views (
  id         bigint generated always as identity primary key,
  visitor_id text not null,
  path       text not null default '/',
  referrer   text,
  created_at timestamptz not null default now()
);

create index if not exists idx_page_views_created on page_views (created_at desc);
create index if not exists idx_page_views_visitor on page_views (visitor_id, created_at desc);

-- Active sessions: heartbeat-based online tracking
create table if not exists active_sessions (
  id         text primary key,
  user_id    uuid references auth.users(id),
  last_seen  timestamptz not null default now(),
  path       text
);

create index if not exists idx_active_sessions_seen on active_sessions (last_seen desc);

-- RLS: page_views insert-only for anon, select for service role
alter table page_views enable row level security;
create policy "Anyone can insert page views" on page_views for insert with check (true);

alter table active_sessions enable row level security;
create policy "Anyone can upsert sessions" on active_sessions for all using (true) with check (true);

-- Cleanup: delete sessions older than 5 minutes (run via cron or on each heartbeat)
create or replace function cleanup_stale_sessions()
returns void language sql security definer as $$
  delete from active_sessions where last_seen < now() - interval '5 minutes';
$$;

-- Analytics summary function
create or replace function get_analytics_summary()
returns json language plpgsql security definer as $$
declare
  result json;
begin
  -- Clean up stale sessions first
  perform cleanup_stale_sessions();

  select json_build_object(
    'online_now', (select count(*) from active_sessions where last_seen > now() - interval '2 minutes'),
    'today', (select count(distinct visitor_id) from page_views where created_at >= date_trunc('day', now())),
    'this_week', (select count(distinct visitor_id) from page_views where created_at >= date_trunc('week', now())),
    'this_month', (select count(distinct visitor_id) from page_views where created_at >= date_trunc('month', now())),
    'total_views_today', (select count(*) from page_views where created_at >= date_trunc('day', now())),
    'total_views_month', (select count(*) from page_views where created_at >= date_trunc('month', now()))
  ) into result;

  return result;
end;
$$;
