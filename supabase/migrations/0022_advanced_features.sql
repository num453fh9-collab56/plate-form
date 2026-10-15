-- ============================================================
-- PHASE 1-4: Advanced Features Migration
-- ============================================================

-- 1. Online/Offline & Response Time
alter table public.profiles add column if not exists last_seen_at timestamptz;
alter table public.profiles add column if not exists avg_response_minutes int;
alter table public.profiles add column if not exists is_online boolean default false;

-- 2. Order auto-complete after 3 days
alter table public.orders add column if not exists auto_complete_at timestamptz;

-- 3. Order extensions
create table if not exists order_extensions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  requested_by uuid not null references auth.users(id),
  extra_days int not null default 1,
  reason text default '',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);
create index if not exists idx_order_extensions_order on order_extensions(order_id);
alter table order_extensions enable row level security;
create policy "Order participants see extensions" on order_extensions for select using (
  auth.uid() in (select buyer_id from orders where orders.id = order_extensions.order_id
                  union select seller_id from orders where orders.id = order_extensions.order_id)
);
create policy "Participants insert extensions" on order_extensions for insert with check (auth.uid() = requested_by);

-- 4. Tips
create table if not exists tips (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  buyer_id uuid not null references auth.users(id),
  seller_id uuid not null references auth.users(id),
  amount numeric(10,2) not null check (amount > 0),
  currency text default 'usd',
  stripe_payment_intent text,
  status text default 'pending' check (status in ('pending','paid','failed')),
  created_at timestamptz default now()
);
create index if not exists idx_tips_order on tips(order_id);
alter table tips enable row level security;
create policy "Tip participants can view" on tips for select using (auth.uid() in (buyer_id, seller_id));
create policy "Buyers can tip" on tips for insert with check (auth.uid() = buyer_id);

-- 5. Referral program
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id),
  referred_id uuid references auth.users(id),
  referral_code text not null unique,
  status text default 'pending' check (status in ('pending','signed_up','first_order','credited')),
  referrer_credit numeric(10,2) default 0,
  referred_credit numeric(10,2) default 0,
  created_at timestamptz default now()
);
create index if not exists idx_referrals_referrer on referrals(referrer_id);
create index if not exists idx_referrals_code on referrals(referral_code);
alter table referrals enable row level security;
create policy "Users see own referrals" on referrals for select using (auth.uid() = referrer_id or auth.uid() = referred_id);
create policy "Users create referrals" on referrals for insert with check (auth.uid() = referrer_id);

alter table public.profiles add column if not exists referral_code text;
alter table public.profiles add column if not exists referred_by text;
alter table public.profiles add column if not exists referral_credits numeric(10,2) default 0;

-- 6. Promoted gigs
create table if not exists promoted_gigs (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references gigs(id) on delete cascade,
  seller_id uuid not null references auth.users(id),
  budget numeric(10,2) not null default 0,
  spent numeric(10,2) not null default 0,
  daily_budget numeric(10,2) default 10,
  status text default 'active' check (status in ('active','paused','exhausted','ended')),
  impressions int default 0,
  clicks int default 0,
  started_at timestamptz default now(),
  ends_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists idx_promoted_gig on promoted_gigs(gig_id);
alter table promoted_gigs enable row level security;
create policy "Sellers manage own promotions" on promoted_gigs for all using (auth.uid() = seller_id);

-- 7. Skill tests
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

-- 8. Recurring orders
create table if not exists recurring_orders (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid references gigs(id) on delete set null,
  buyer_id uuid not null references auth.users(id),
  seller_id uuid not null references auth.users(id),
  title text not null,
  amount numeric(10,2) not null,
  currency text default 'usd',
  frequency text not null check (frequency in ('weekly','biweekly','monthly','quarterly')),
  next_charge_at timestamptz not null,
  status text default 'active' check (status in ('active','paused','cancelled')),
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

-- 9. Gig shares tracking
create table if not exists gig_shares (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references gigs(id) on delete cascade,
  user_id uuid references auth.users(id),
  platform text not null,
  created_at timestamptz default now()
);
create index if not exists idx_gig_shares_gig on gig_shares(gig_id);
alter table gig_shares enable row level security;
create policy "Anyone can insert shares" on gig_shares for insert with check (true);
create policy "Gig owners see shares" on gig_shares for select using (
  auth.uid() in (select seller_id from gigs where gigs.id = gig_shares.gig_id)
);

-- 10. Team / Agency accounts
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id),
  description text default '',
  logo text default '',
  created_at timestamptz default now()
);
alter table teams enable row level security;
create policy "Team members can read" on teams for select using (
  auth.uid() = owner_id or auth.uid() in (select user_id from team_members where team_members.team_id = teams.id)
);
create policy "Owner manages team" on teams for all using (auth.uid() = owner_id);

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  role text default 'member' check (role in ('owner','admin','member')),
  joined_at timestamptz default now(),
  unique(team_id, user_id)
);
create index if not exists idx_team_members_team on team_members(team_id);
create index if not exists idx_team_members_user on team_members(user_id);
alter table team_members enable row level security;
create policy "Team members can view" on team_members for select using (
  auth.uid() in (select user_id from team_members tm2 where tm2.team_id = team_members.team_id)
);

-- 11. Buyer verification
alter table public.profiles add column if not exists phone_verified boolean default false;
alter table public.profiles add column if not exists email_verified boolean default false;
alter table public.profiles add column if not exists id_document_url text;
alter table public.profiles add column if not exists verification_status text default 'none' check (verification_status in ('none','pending','verified','rejected'));

-- 12. Wishlist for comparison
create table if not exists wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  name text default 'My List',
  gig_ids uuid[] default '{}',
  created_at timestamptz default now()
);
alter table wishlists enable row level security;
create policy "Users manage own wishlists" on wishlists for all using (auth.uid() = user_id);

-- 13. Tax rates per country
create table if not exists tax_rates (
  id uuid primary key default gen_random_uuid(),
  country_code text not null,
  tax_name text not null,
  rate numeric(5,4) not null,
  is_active boolean default true,
  unique(country_code, tax_name)
);
alter table tax_rates enable row level security;
create policy "Anyone can read tax rates" on tax_rates for select using (true);

-- 14. Affiliate program
create table if not exists affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  affiliate_code text not null unique,
  commission_rate numeric(5,4) default 0.10,
  total_earned numeric(10,2) default 0,
  total_clicks int default 0,
  total_conversions int default 0,
  status text default 'active' check (status in ('active','paused','banned')),
  payout_method text default 'stripe',
  created_at timestamptz default now()
);
create index if not exists idx_affiliates_code on affiliates(affiliate_code);
alter table affiliates enable row level security;
create policy "Users manage own affiliate" on affiliates for all using (auth.uid() = user_id);

create table if not exists affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates(id) on delete cascade,
  gig_id uuid references gigs(id),
  ip_hash text,
  created_at timestamptz default now()
);
create index if not exists idx_aff_clicks on affiliate_clicks(affiliate_id);

create table if not exists affiliate_conversions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates(id) on delete cascade,
  order_id uuid not null references orders(id),
  commission numeric(10,2) not null,
  status text default 'pending' check (status in ('pending','approved','paid')),
  created_at timestamptz default now()
);
alter table affiliate_conversions enable row level security;
create policy "Affiliates see own conversions" on affiliate_conversions for select using (
  auth.uid() in (select user_id from affiliates where affiliates.id = affiliate_conversions.affiliate_id)
);
