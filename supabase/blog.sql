-- Hirelyx Blog System
-- Run in Supabase Dashboard → SQL Editor

create table public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  cover_image text not null default '',
  author_name text not null default 'Hirelyx Team',
  author_avatar text not null default '',
  category text not null default 'general',
  tags text[] not null default '{}',
  status text not null default 'draft',
  read_time int not null default 3,
  views int not null default 0,
  is_featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_blog_slug on public.blog_posts(slug);
create index idx_blog_status on public.blog_posts(status, published_at);
create index idx_blog_category on public.blog_posts(category);

alter table public.blog_posts enable row level security;

create policy "blog_public_select" on public.blog_posts for select using (status = 'published');
