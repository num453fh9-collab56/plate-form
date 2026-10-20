-- Hirelyx Reviews / Testimonials
-- Run in Supabase Dashboard → SQL Editor

create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references auth.users(id) on delete set null,
  client_name text not null default '',
  client_email text not null default '',
  project_id uuid references public.projects(id) on delete set null,
  service text not null default '',
  rating int not null default 5,
  title text not null default '',
  content text not null default '',
  is_featured boolean not null default false,
  is_approved boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists idx_reviews_client on public.reviews(client_id);
create index if not exists idx_reviews_approved on public.reviews(is_approved, created_at);

alter table public.reviews enable row level security;

-- Anyone can see approved reviews
create policy "reviews_public_select" on public.reviews for select using (is_approved = true);

-- Clients can see their own (including unapproved)
create policy "reviews_own_select" on public.reviews for select using (client_id = auth.uid());

-- Clients can submit reviews
create policy "reviews_client_insert" on public.reviews for insert with check (client_id = auth.uid());
