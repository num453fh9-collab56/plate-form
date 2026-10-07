-- Phase B6: gig requirements, faq, extras
alter table public.gigs add column if not exists requirements text;
alter table public.gigs add column if not exists faq jsonb not null default '[]';
alter table public.gigs add column if not exists extras jsonb not null default '[]';
