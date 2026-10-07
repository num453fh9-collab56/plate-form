-- Phase B3: Stripe Connect payouts
alter table public.profiles add column if not exists stripe_account_id text;

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  seller_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null default 0,
  currency text not null default 'usd',
  status text not null default 'pending', -- pending | paid | failed
  stripe_transfer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payouts_seller_idx on public.payouts (seller_id, created_at desc);

alter table public.payouts enable row level security;

drop policy if exists "payouts_select_seller" on public.payouts;
create policy "payouts_select_seller" on public.payouts
  for select using (auth.uid() = seller_id);

drop trigger if exists trg_payouts_updated on public.payouts;
create trigger trg_payouts_updated before update on public.payouts
  for each row execute function public.set_updated_at();
