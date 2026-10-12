-- Reviews table: buyers leave reviews on completed orders
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  gig_id uuid not null references gigs(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text default '',
  seller_reply text default null,
  seller_replied_at timestamptz default null,
  created_at timestamptz default now()
);

-- One review per order
create unique index if not exists reviews_order_unique on reviews(order_id);

-- Fast lookups by gig and seller
create index if not exists reviews_gig_id on reviews(gig_id);
create index if not exists reviews_seller_id on reviews(seller_id);

-- RLS
alter table reviews enable row level security;

create policy "Anyone can read reviews"
  on reviews for select using (true);

create policy "Buyers can insert their own review"
  on reviews for insert with check (auth.uid() = reviewer_id);

create policy "Sellers can update their reply"
  on reviews for update using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);
