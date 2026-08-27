-- ProjectOS final feature migration
alter table public.projects add column if not exists architecture_notes text;
alter table public.projects add column if not exists setup_notes text;
alter table public.projects add column if not exists environment_notes text;

create table if not exists public.project_deployments(
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.projects(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 provider text not null default 'other',
 environment text not null default 'production',
 status text not null default 'unknown' check(status in('ready','building','failed','unknown')),
 url text,
 version text,
 deployed_at timestamptz default now(),
 created_at timestamptz not null default now()
);
create table if not exists public.project_secret_refs(
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.projects(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null,
 location text not null,
 notes text,
 created_at timestamptz not null default now(),
 unique(project_id,name)
);
alter table public.project_deployments enable row level security;
alter table public.project_secret_refs enable row level security;
drop policy if exists own_all_project_deployments on public.project_deployments;
create policy own_all_project_deployments on public.project_deployments for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists own_all_project_secret_refs on public.project_secret_refs;
create policy own_all_project_secret_refs on public.project_secret_refs for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create index if not exists deployments_project_date_idx on public.project_deployments(project_id,deployed_at desc);
