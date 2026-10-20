-- Hirelyx Quote / Invoice System
-- Run in Supabase Dashboard → SQL Editor (in chunks)

-- 1) Quotes & Invoices table
create table if not exists public.invoices (
  id uuid default gen_random_uuid() primary key,
  invoice_number text not null default '',
  type text not null default 'quote',
  project_id uuid references public.projects(id) on delete set null,
  client_id uuid references auth.users(id) on delete set null,
  client_name text not null default '',
  client_email text not null default '',
  status text not null default 'draft',
  items jsonb not null default '[]',
  subtotal numeric(10,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  currency text not null default 'USD',
  notes text not null default '',
  due_date date,
  paid_at timestamptz,
  stripe_payment_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Indexes
create index if not exists idx_invoices_client on public.invoices(client_id);
create index if not exists idx_invoices_project on public.invoices(project_id);
create index if not exists idx_invoices_number on public.invoices(invoice_number);

-- 3) RLS
alter table public.invoices enable row level security;

-- Clients see their own invoices
create policy "invoices_client_select" on public.invoices for select using (client_id = auth.uid());
