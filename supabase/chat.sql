-- Hirelyx Chat System
-- Run this in Supabase Dashboard → SQL Editor

-- 1) Conversations
create table if not exists public.chat_conversations (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references auth.users(id) on delete set null,
  client_name text not null default '',
  client_email text not null default '',
  status text not null default 'open',
  last_message text not null default '',
  last_message_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 2) Messages
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender_id uuid,
  sender_role text not null default 'client',
  content text not null,
  created_at timestamptz default now()
);

-- 3) Indexes
create index if not exists idx_chat_msg_conv on public.chat_messages(conversation_id, created_at);
create index if not exists idx_chat_conv_client on public.chat_conversations(client_id);
create index if not exists idx_chat_conv_status on public.chat_conversations(status, last_message_at desc);

-- 4) RLS
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

-- Clients: own conversations
create policy "chat_conv_select" on public.chat_conversations
  for select using (client_id = auth.uid());
create policy "chat_conv_insert" on public.chat_conversations
  for insert with check (client_id = auth.uid());
create policy "chat_conv_update" on public.chat_conversations
  for update using (client_id = auth.uid());

-- Clients: messages in own conversations
create policy "chat_msg_select" on public.chat_messages
  for select using (
    exists (select 1 from public.chat_conversations where id = conversation_id and client_id = auth.uid())
  );
create policy "chat_msg_insert" on public.chat_messages
  for insert with check (
    exists (select 1 from public.chat_conversations where id = conversation_id and client_id = auth.uid())
  );

-- 5) Realtime
alter publication supabase_realtime add table public.chat_messages;
