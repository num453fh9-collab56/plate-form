-- Hirelyx Booking / Consultation Calendar
-- Run in Supabase Dashboard → SQL Editor (in chunks)

-- 1) Available time slots (team sets these)
create table if not exists public.booking_slots (
  id uuid default gen_random_uuid() primary key,
  title text not null default 'Consultation',
  service text not null default '',
  date date not null,
  start_time time not null,
  end_time time not null,
  max_bookings int not null default 1,
  current_bookings int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- 2) Client bookings
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  slot_id uuid not null references public.booking_slots(id) on delete cascade,
  client_id uuid references auth.users(id) on delete set null,
  client_name text not null default '',
  client_email text not null default '',
  client_phone text not null default '',
  service text not null default '',
  message text not null default '',
  status text not null default 'confirmed',
  created_at timestamptz default now()
);

-- 3) Indexes
create index if not exists idx_slots_date on public.booking_slots(date, is_active);
create index if not exists idx_bookings_slot on public.bookings(slot_id);
create index if not exists idx_bookings_client on public.bookings(client_id);

-- 4) RLS
alter table public.booking_slots enable row level security;
alter table public.bookings enable row level security;

-- Anyone can see active slots
create policy "slots_public_select" on public.booking_slots for select using (is_active = true);

-- Clients see their own bookings
create policy "bookings_client_select" on public.bookings for select using (client_id = auth.uid());

-- Clients can book (insert)
create policy "bookings_client_insert" on public.bookings for insert with check (client_id = auth.uid());
