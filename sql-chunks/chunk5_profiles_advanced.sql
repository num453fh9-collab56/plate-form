-- Chunk 5: Profile advanced columns
alter table public.profiles add column if not exists last_seen_at timestamptz;
alter table public.profiles add column if not exists avg_response_minutes int;
alter table public.profiles add column if not exists is_online boolean default false;
alter table public.profiles add column if not exists referral_code text;
alter table public.profiles add column if not exists referred_by text;
alter table public.profiles add column if not exists referral_credits numeric(10,2) default 0;
alter table public.profiles add column if not exists phone_verified boolean default false;
alter table public.profiles add column if not exists email_verified boolean default false;
alter table public.profiles add column if not exists id_document_url text;
alter table public.profiles add column if not exists verification_status text default 'none';
alter table public.orders add column if not exists auto_complete_at timestamptz;
