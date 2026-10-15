-- Chunk 7: Referrals & Affiliates
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id),
  referred_id uuid references auth.users(id),
  referral_code text not null unique,
  status text default 'pending',
  referrer_credit numeric(10,2) default 0,
  referred_credit numeric(10,2) default 0,
  created_at timestamptz default now()
);
create index if not exists idx_referrals_referrer on referrals(referrer_id);
create index if not exists idx_referrals_code on referrals(referral_code);
alter table referrals enable row level security;
create policy "Users see own referrals" on referrals for select using (auth.uid() = referrer_id or auth.uid() = referred_id);
create policy "Users create referrals" on referrals for insert with check (auth.uid() = referrer_id);

create table if not exists affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  affiliate_code text not null unique,
  commission_rate numeric(5,4) default 0.10,
  total_earned numeric(10,2) default 0,
  total_clicks int default 0,
  total_conversions int default 0,
  status text default 'active',
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
  status text default 'pending',
  created_at timestamptz default now()
);
alter table affiliate_conversions enable row level security;
create policy "Affiliates see own conversions" on affiliate_conversions for select using (
  auth.uid() in (select user_id from affiliates where affiliates.id = affiliate_conversions.affiliate_id)
);

-- Helper function for referral credits
create or replace function increment_referral_credits(uid uuid, amt numeric)
returns void language sql as $$
  update profiles set referral_credits = coalesce(referral_credits, 0) + amt where user_id = uid;
$$;
