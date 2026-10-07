-- Phase B5: gig images + packages
alter table public.gigs add column if not exists images text[] not null default '{}';
alter table public.gigs add column if not exists packages jsonb;
