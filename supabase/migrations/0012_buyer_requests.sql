-- Phase M2: buyer requests (job posts) and seller proposals.
-- Writes go through /api/jobs (service role).

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

-- Helpers are SECURITY DEFINER so the two tables' policies
-- can look at each other without infinite RLS recursion.
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

-- Keep job_posts.proposals_count in sync.
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
