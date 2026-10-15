-- Chunk 9: Wishlists, Gig Shares, Teams, Tax rates
create table if not exists wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  name text not null default 'Default',
  gig_ids uuid[] default '{}',
  created_at timestamptz default now()
);
create index if not exists idx_wishlists_user on wishlists(user_id);
alter table wishlists enable row level security;
create policy "Users manage own wishlists" on wishlists for all using (auth.uid() = user_id);

create table if not exists gig_shares (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references gigs(id) on delete cascade,
  user_id uuid references auth.users(id),
  platform text not null,
  created_at timestamptz default now()
);
create index if not exists idx_gig_shares_gig on gig_shares(gig_id);

-- Create BOTH tables first, then add policies (team_members must exist before teams policy references it)
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id),
  description text default '',
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  role text default 'member',
  invited_email text,
  status text default 'pending',
  joined_at timestamptz,
  created_at timestamptz default now(),
  unique(team_id, user_id)
);
create index if not exists idx_team_members_team on team_members(team_id);
create index if not exists idx_team_members_user on team_members(user_id);

-- Now add RLS policies (both tables exist)
alter table teams enable row level security;
create policy "Team members see team" on teams for select using (
  auth.uid() = owner_id or auth.uid() in (select user_id from team_members where team_members.team_id = teams.id)
);
create policy "Owners manage teams" on teams for all using (auth.uid() = owner_id);

alter table team_members enable row level security;
create policy "Team participants see members" on team_members for select using (
  auth.uid() in (select owner_id from teams where teams.id = team_members.team_id)
  or auth.uid() = user_id
);

create table if not exists tax_rates (
  id uuid primary key default gen_random_uuid(),
  country_code text not null unique,
  country_name text not null,
  tax_rate numeric(5,4) not null default 0,
  tax_name text default 'VAT',
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table tax_rates enable row level security;
create policy "Anyone can read tax rates" on tax_rates for select using (true);

-- Seed common tax rates
insert into tax_rates (country_code, country_name, tax_rate, tax_name) values
  ('PK', 'Pakistan', 0.17, 'GST'),
  ('US', 'United States', 0.00, 'Sales Tax'),
  ('GB', 'United Kingdom', 0.20, 'VAT'),
  ('AE', 'UAE', 0.05, 'VAT'),
  ('SA', 'Saudi Arabia', 0.15, 'VAT'),
  ('IN', 'India', 0.18, 'GST'),
  ('DE', 'Germany', 0.19, 'VAT'),
  ('FR', 'France', 0.20, 'VAT'),
  ('CA', 'Canada', 0.13, 'HST'),
  ('AU', 'Australia', 0.10, 'GST')
on conflict (country_code) do nothing;
