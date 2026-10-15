-- Chunk 6: Order extensions & Tips
create table if not exists order_extensions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  requested_by uuid not null references auth.users(id),
  extra_days int not null default 1,
  reason text default '',
  status text not null default 'pending',
  created_at timestamptz default now()
);
create index if not exists idx_order_extensions_order on order_extensions(order_id);
alter table order_extensions enable row level security;
create policy "Order participants see extensions" on order_extensions for select using (
  auth.uid() in (select buyer_id from orders where orders.id = order_extensions.order_id
                  union select seller_id from orders where orders.id = order_extensions.order_id)
);
create policy "Participants insert extensions" on order_extensions for insert with check (auth.uid() = requested_by);

create table if not exists tips (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  buyer_id uuid not null references auth.users(id),
  seller_id uuid not null references auth.users(id),
  amount numeric(10,2) not null,
  currency text default 'usd',
  stripe_payment_intent text,
  status text default 'pending',
  created_at timestamptz default now()
);
create index if not exists idx_tips_order on tips(order_id);
alter table tips enable row level security;
create policy "Tip participants can view" on tips for select using (auth.uid() in (buyer_id, seller_id));
create policy "Buyers can tip" on tips for insert with check (auth.uid() = buyer_id);
