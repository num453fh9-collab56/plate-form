-- Delivery files: track files uploaded with each delivery
create table if not exists order_deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  message text default '',
  files jsonb default '[]',
  created_at timestamptz default now()
);

create index if not exists order_deliveries_order on order_deliveries(order_id);

alter table order_deliveries enable row level security;

create policy "Order participants can read deliveries"
  on order_deliveries for select using (
    auth.uid() in (
      select buyer_id from orders where orders.id = order_deliveries.order_id
      union
      select seller_id from orders where orders.id = order_deliveries.order_id
    )
  );

create policy "Sellers can insert deliveries"
  on order_deliveries for insert with check (auth.uid() = seller_id);

-- Storage bucket for delivery files
insert into storage.buckets (id, name, public)
values ('deliveries', 'deliveries', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload delivery files"
  on storage.objects for insert
  with check (bucket_id = 'deliveries' and auth.role() = 'authenticated');

create policy "Anyone can read delivery files"
  on storage.objects for select
  using (bucket_id = 'deliveries');
