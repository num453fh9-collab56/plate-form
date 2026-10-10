-- Phase S2: users may edit their own profile, but never the
-- trust fields (verified badges, payout account). Only the
-- server (service role) or the SQL editor can change them.

create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.role() in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.id_verified := false;
      new.payment_verified := false;
      new.stripe_account_id := null;
    else
      new.id_verified := old.id_verified;
      new.payment_verified := old.payment_verified;
      new.stripe_account_id := old.stripe_account_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_protect
  on public.profiles;

create trigger trg_profiles_protect
  before insert or update on public.profiles
  for each row
  execute function public.protect_profile_columns();
