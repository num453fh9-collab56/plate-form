-- Add role-based user system: freelancer, buyer, or both
alter table public.profiles
  add column if not exists role text check (role in ('freelancer', 'buyer', 'both'));

-- Buyer-specific profile data (company, needs, preferences)
alter table public.profiles
  add column if not exists buyer_profile jsonb not null default '{}';

create index if not exists profiles_role_idx on public.profiles (role);
