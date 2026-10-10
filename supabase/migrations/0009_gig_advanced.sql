-- Phase G1: advanced gigs — drafts/pause, search tags, structured buyer
-- requirements, per-package features, and package/extras on orders.

-- status: 'draft' | 'published' | 'paused'
alter table public.gigs add column if not exists status text not null default 'published';
alter table public.gigs add column if not exists tags text[] not null default '{}';
-- requirement_questions: [{ "question": "…", "type": "text" | "file", "required": true }]
alter table public.gigs add column if not exists requirement_questions jsonb not null default '[]';
alter table public.gigs add column if not exists views integer not null default 0;

create index if not exists gigs_status_idx on public.gigs (status, created_at desc);

-- Public sees published gigs; sellers always see their own drafts/paused gigs.
drop policy if exists "gigs_select_all" on public.gigs;
create policy "gigs_select_all" on public.gigs
  for select using (status = 'published' or auth.uid() = seller_id);

-- Which package / extras the buyer chose (price is recomputed server-side).
alter table public.orders add column if not exists package_key text;
alter table public.orders add column if not exists extras jsonb not null default '[]';

-- View counter callable by anyone, touching only the views column.
create or replace function public.increment_gig_views(gig uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.gigs set views = views + 1 where id = gig and status = 'published';
$$;
grant execute on function public.increment_gig_views(uuid) to anon, authenticated;
