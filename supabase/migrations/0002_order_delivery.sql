-- Phase B2: delivery / revision flow on orders
alter table public.orders add column if not exists delivery_note text;
alter table public.orders add column if not exists revision_note text;
alter table public.orders add column if not exists revision_count int not null default 0;
alter table public.orders add column if not exists delivered_at timestamptz;
