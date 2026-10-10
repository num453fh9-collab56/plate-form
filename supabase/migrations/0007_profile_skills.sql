-- Phase B7: richer skills step — per-skill proficiency, experience, capacity
-- skill_levels: { "React": "Expert", "Figma": "Intermediate", ... }
alter table public.profiles add column if not exists skill_levels jsonb not null default '{}';
alter table public.profiles add column if not exists experience_years numeric;
alter table public.profiles add column if not exists weekly_hours text;
alter table public.profiles add column if not exists response_time text;
