-- ============================================================================
-- APEX / WorkVortex — full backend schema (0001_init)
-- Run this ONCE in Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run: uses IF NOT EXISTS / DROP ... IF EXISTS where needed.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- shared trigger helper: keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===========================================================================
-- PROFILES
-- ===========================================================================
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists title text;
alter table public.profiles add column if not exists primary_category text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists languages text;
alter table public.profiles add column if not exists avatar text;
alter table public.profiles add column if not exists skills text[] default '{}';
alter table public.profiles add column if not exists hourly_rate numeric;
alter table public.profiles add column if not exists project_rate numeric;
alter table public.profiles add column if not exists availability text;
alter table public.profiles add column if not exists portfolio text;
alter table public.profiles add column if not exists intro_video text;
alter table public.profiles add column if not exists intro_video_name text;
alter table public.profiles add column if not exists email_masked boolean default true;
alter table public.profiles add column if not exists profile_public boolean default true;
alter table public.profiles add column if not exists two_factor boolean default false;
alter table public.profiles add column if not exists id_verified boolean default false;
alter table public.profiles add column if not exists payment_verified boolean default false;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public" on public.profiles
  for select using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, full_name, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- GIGS  (existing table is empty → recreate cleanly)
-- ===========================================================================
drop table if exists public.gigs cascade;
create table public.gigs (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text not null default '',
  category text,
  skills text[] not null default '{}',
  price numeric not null default 0,
  delivery_days int not null default 1,
  seller_name text,
  video text,
  video_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gigs_created_at_idx on public.gigs (created_at desc);
create index if not exists gigs_category_idx on public.gigs (category);
create index if not exists gigs_seller_idx on public.gigs (seller_id);

alter table public.gigs enable row level security;

drop policy if exists "gigs_select_all" on public.gigs;
create policy "gigs_select_all" on public.gigs for select using (true);

drop policy if exists "gigs_insert_own" on public.gigs;
create policy "gigs_insert_own" on public.gigs
  for insert with check (auth.uid() = seller_id);

drop policy if exists "gigs_update_own" on public.gigs;
create policy "gigs_update_own" on public.gigs
  for update using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

drop policy if exists "gigs_delete_own" on public.gigs;
create policy "gigs_delete_own" on public.gigs
  for delete using (auth.uid() = seller_id);

drop trigger if exists trg_gigs_updated on public.gigs;
create trigger trg_gigs_updated before update on public.gigs
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- PORTFOLIO PROJECTS
-- ===========================================================================
create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text,
  summary text default '',
  tags text[] not null default '{}',
  link text,
  image text,
  cover text,
  video text,
  video_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_user_idx on public.portfolio_projects (user_id, created_at desc);

alter table public.portfolio_projects enable row level security;

drop policy if exists "portfolio_select_all" on public.portfolio_projects;
create policy "portfolio_select_all" on public.portfolio_projects for select using (true);

drop policy if exists "portfolio_insert_own" on public.portfolio_projects;
create policy "portfolio_insert_own" on public.portfolio_projects
  for insert with check (auth.uid() = user_id);

drop policy if exists "portfolio_update_own" on public.portfolio_projects;
create policy "portfolio_update_own" on public.portfolio_projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "portfolio_delete_own" on public.portfolio_projects;
create policy "portfolio_delete_own" on public.portfolio_projects
  for delete using (auth.uid() = user_id);

drop trigger if exists trg_portfolio_updated on public.portfolio_projects;
create trigger trg_portfolio_updated before update on public.portfolio_projects
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- FAVORITES
-- ===========================================================================
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  gig_id uuid not null references public.gigs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, gig_id)
);

alter table public.favorites enable row level security;

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

-- ===========================================================================
-- REVIEWS
-- ===========================================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid references auth.users(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (gig_id, reviewer_id)
);

create index if not exists reviews_gig_idx on public.reviews (gig_id);

alter table public.reviews enable row level security;

drop policy if exists "reviews_select_all" on public.reviews;
create policy "reviews_select_all" on public.reviews for select using (true);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert with check (auth.uid() = reviewer_id);

drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews
  for update using (auth.uid() = reviewer_id) with check (auth.uid() = reviewer_id);

drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own" on public.reviews
  for delete using (auth.uid() = reviewer_id);

-- ===========================================================================
-- CONVERSATIONS + MESSAGES
-- ===========================================================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid references public.gigs(id) on delete set null,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_buyer_idx on public.conversations (buyer_id, updated_at desc);
create index if not exists conversations_seller_idx on public.conversations (seller_id, updated_at desc);

alter table public.conversations enable row level security;

drop policy if exists "conversations_select_participant" on public.conversations;
create policy "conversations_select_participant" on public.conversations
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "conversations_insert_buyer" on public.conversations;
create policy "conversations_insert_buyer" on public.conversations
  for insert with check (auth.uid() = buyer_id);

drop policy if exists "conversations_update_participant" on public.conversations;
create policy "conversations_update_participant" on public.conversations
  for update using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop trigger if exists trg_conversations_updated on public.conversations;
create trigger trg_conversations_updated before update on public.conversations
  for each row execute function public.set_updated_at();

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

alter table public.messages enable row level security;

drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

drop policy if exists "messages_insert_participant" on public.messages;
create policy "messages_insert_participant" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

drop policy if exists "messages_update_participant" on public.messages;
create policy "messages_update_participant" on public.messages
  for update using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- ===========================================================================
-- ORDERS (ready for Stripe — Phase 3)
-- ===========================================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid references public.gigs(id) on delete set null,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid references auth.users(id) on delete set null,
  amount numeric not null default 0,
  currency text not null default 'usd',
  status text not null default 'pending', -- pending | paid | delivered | completed | cancelled
  stripe_session_id text,
  stripe_payment_intent text,
  requirements text,
  delivery_days int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_buyer_idx on public.orders (buyer_id, created_at desc);
create index if not exists orders_seller_idx on public.orders (seller_id, created_at desc);

alter table public.orders enable row level security;

drop policy if exists "orders_select_participant" on public.orders;
create policy "orders_select_participant" on public.orders
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "orders_insert_buyer" on public.orders;
create policy "orders_insert_buyer" on public.orders
  for insert with check (auth.uid() = buyer_id);

drop policy if exists "orders_update_participant" on public.orders;
create policy "orders_update_participant" on public.orders
  for update using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- STORAGE BUCKETS
-- ===========================================================================
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('gig-media', 'gig-media', true),
  ('portfolio', 'portfolio', true),
  ('intro-videos', 'intro-videos', true)
on conflict (id) do nothing;

-- public read for all four buckets
drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select using (
    bucket_id in ('avatars', 'gig-media', 'portfolio', 'intro-videos')
  );

-- authenticated users may write only inside a folder named after their uid
drop policy if exists "media_authenticated_insert" on storage.objects;
create policy "media_authenticated_insert" on storage.objects
  for insert to authenticated with check (
    bucket_id in ('avatars', 'gig-media', 'portfolio', 'intro-videos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "media_authenticated_update" on storage.objects;
create policy "media_authenticated_update" on storage.objects
  for update to authenticated using (
    bucket_id in ('avatars', 'gig-media', 'portfolio', 'intro-videos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "media_authenticated_delete" on storage.objects;
create policy "media_authenticated_delete" on storage.objects
  for delete to authenticated using (
    bucket_id in ('avatars', 'gig-media', 'portfolio', 'intro-videos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ===========================================================================
-- REALTIME (messaging live updates)
-- ===========================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'gigs'
  ) then
    alter publication supabase_realtime add table public.gigs;
  end if;
end $$;
