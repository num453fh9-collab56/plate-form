-- Hirelyx Project Tracker
-- Run in Supabase Dashboard → SQL Editor

-- 1) Projects table
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null default '',
  client_id uuid references auth.users(id) on delete set null,
  client_name text not null default '',
  client_email text not null default '',
  service text not null default '',
  status text not null default 'discovery',
  stage int not null default 0,
  budget text not null default '',
  deadline date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Project milestones
create table if not exists public.project_milestones (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text not null default '',
  stage int not null default 0,
  status text not null default 'pending',
  due_date date,
  completed_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- 3) Project activity / comments
create table if not exists public.project_activity (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid,
  user_role text not null default 'team',
  type text not null default 'comment',
  content text not null default '',
  created_at timestamptz default now()
);

-- 4) Indexes
create index if not exists idx_projects_client on public.projects(client_id);
create index if not exists idx_milestones_project on public.project_milestones(project_id, sort_order);
create index if not exists idx_activity_project on public.project_activity(project_id, created_at);

-- 5) RLS
alter table public.projects enable row level security;
alter table public.project_milestones enable row level security;
alter table public.project_activity enable row level security;

-- Clients see their own projects
create policy "proj_client_select" on public.projects for select using (client_id = auth.uid());
create policy "miles_client_select" on public.project_milestones for select using (
  exists (select 1 from public.projects where id = project_id and client_id = auth.uid())
);
create policy "activity_client_select" on public.project_activity for select using (
  exists (select 1 from public.projects where id = project_id and client_id = auth.uid())
);
-- Clients can add comments
create policy "activity_client_insert" on public.project_activity for insert with check (
  exists (select 1 from public.projects where id = project_id and client_id = auth.uid())
  and user_role = 'client'
);

-- 6) Realtime
alter publication supabase_realtime add table public.project_activity;
