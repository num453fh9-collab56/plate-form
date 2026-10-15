-- Chunk 8: Promoted gigs, Skill tests, Recurring orders
create table if not exists promoted_gigs (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references gigs(id) on delete cascade,
  seller_id uuid not null references auth.users(id),
  budget numeric(10,2) not null default 0,
  spent numeric(10,2) not null default 0,
  daily_budget numeric(10,2) default 10,
  status text default 'active',
  impressions int default 0,
  clicks int default 0,
  started_at timestamptz default now(),
  ends_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists idx_promoted_gig on promoted_gigs(gig_id);
alter table promoted_gigs enable row level security;
create policy "Sellers manage own promotions" on promoted_gigs for all using (auth.uid() = seller_id);

create table if not exists skill_tests (
  id uuid primary key default gen_random_uuid(),
  skill_name text not null,
  category text,
  description text,
  time_limit_minutes int default 30,
  passing_score int default 70,
  questions jsonb not null default '[]',
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table skill_tests enable row level security;
create policy "Anyone can read tests" on skill_tests for select using (true);

create table if not exists skill_test_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  test_id uuid not null references skill_tests(id) on delete cascade,
  score int not null,
  passed boolean not null default false,
  answers jsonb default '[]',
  completed_at timestamptz default now(),
  unique(user_id, test_id)
);
create index if not exists idx_skill_results_user on skill_test_results(user_id);
alter table skill_test_results enable row level security;
create policy "Users see own results" on skill_test_results for select using (auth.uid() = user_id);
create policy "Users submit results" on skill_test_results for insert with check (auth.uid() = user_id);

create table if not exists recurring_orders (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid references gigs(id) on delete set null,
  buyer_id uuid not null references auth.users(id),
  seller_id uuid not null references auth.users(id),
  title text not null,
  amount numeric(10,2) not null,
  currency text default 'usd',
  frequency text not null,
  next_charge_at timestamptz not null,
  status text default 'active',
  stripe_subscription_id text,
  total_charged numeric(10,2) default 0,
  orders_created int default 0,
  created_at timestamptz default now()
);
create index if not exists idx_recurring_buyer on recurring_orders(buyer_id);
create index if not exists idx_recurring_seller on recurring_orders(seller_id);
alter table recurring_orders enable row level security;
create policy "Participants see recurring" on recurring_orders for select using (auth.uid() in (buyer_id, seller_id));
create policy "Buyers create recurring" on recurring_orders for insert with check (auth.uid() = buyer_id);
