-- Phase M1: custom offers, milestones, buyer requests, disputes,
-- seller levels. Every write goes through server API routes
-- (service role), so most tables only have SELECT policies.
-- Lines are short so the SQL survives copy/paste.

-- ---------- ORDERS: extra columns ----------
alter table public.orders
  add column if not exists paid_at timestamptz;
alter table public.orders
  add column if not exists offer_id uuid;
alter table public.orders
  add column if not exists proposal_id uuid;
alter table public.orders
  add column if not exists title text;

-- ---------- MESSAGES: offer / call cards ----------
alter table public.messages
  add column if not exists kind text not null default 'text';
alter table public.messages
  add column if not exists meta jsonb not null default '{}';

-- Browsers may only send plain text or call links;
-- offer cards are inserted by the server.
drop policy if exists "messages_insert_participant"
  on public.messages;
create policy "messages_insert_participant"
  on public.messages
  for insert with check (
    auth.uid() = sender_id
    and kind in ('text', 'call')
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid()
             or c.seller_id = auth.uid())
    )
  );

-- ---------- CUSTOM OFFERS ----------
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null
    references public.conversations(id) on delete cascade,
  seller_id uuid not null
    references auth.users(id) on delete cascade,
  buyer_id uuid not null
    references auth.users(id) on delete cascade,
  gig_id uuid
    references public.gigs(id) on delete set null,
  title text not null,
  description text not null default '',
  amount numeric not null,
  delivery_days integer not null default 1,
  revisions integer not null default 0,
  milestones jsonb not null default '[]',
  status text not null default 'pending',
  expires_at timestamptz,
  order_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists offers_conversation_idx
  on public.offers (conversation_id, created_at desc);

alter table public.offers enable row level security;

drop policy if exists "offers_select_participant"
  on public.offers;
create policy "offers_select_participant"
  on public.offers
  for select using (
    auth.uid() = seller_id or auth.uid() = buyer_id
  );

-- ---------- ORDER MILESTONES ----------
create table if not exists public.order_milestones (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null
    references public.orders(id) on delete cascade,
  position integer not null default 0,
  title text not null,
  amount numeric not null,
  days integer not null default 1,
  status text not null default 'pending',
  delivery_note text,
  delivered_at timestamptz,
  approved_at timestamptz,
  payout_status text,
  created_at timestamptz not null default now()
);

create index if not exists order_milestones_order_idx
  on public.order_milestones (order_id, position);

alter table public.order_milestones
  enable row level security;

drop policy if exists "milestones_select_participant"
  on public.order_milestones;
create policy "milestones_select_participant"
  on public.order_milestones
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.buyer_id = auth.uid()
             or o.seller_id = auth.uid())
    )
  );

-- Live offer-card updates in chat (accepted / declined).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and tablename = 'offers'
  ) then
    alter publication supabase_realtime
      add table public.offers;
  end if;
end $$;
