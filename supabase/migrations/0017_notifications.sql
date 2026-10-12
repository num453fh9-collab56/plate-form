create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text default '',
  link text default '',
  read boolean default false,
  data jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists notifications_user on notifications(user_id, created_at desc);
create index if not exists notifications_unread on notifications(user_id) where read = false;

alter table notifications enable row level security;

create policy "Users read own notifications"
  on notifications for select using (auth.uid() = user_id);

create policy "Users update own notifications"
  on notifications for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter publication supabase_realtime add table notifications;
