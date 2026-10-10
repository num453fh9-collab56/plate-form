-- Phase B8: profile social links + portfolio ordering
-- social_links: { "linkedin": "https://linkedin.com/in/…", "github": "https://github.com/…", … }
alter table public.profiles add column if not exists social_links jsonb not null default '{}';
alter table public.portfolio_projects add column if not exists position integer not null default 0;
