-- Run this once on an existing ProjectOS database to enable GitHub timeline imports.
alter table public.projects add column if not exists github_synced_at timestamptz;
alter table public.project_updates add column if not exists source text not null default 'manual';
alter table public.project_updates add column if not exists external_id text;
alter table public.project_updates add column if not exists external_url text;
alter table public.project_updates add column if not exists author_name text;
alter table public.project_updates add column if not exists commit_sha text;
drop index if exists public.project_updates_external_unique;
create unique index project_updates_external_unique on public.project_updates(project_id, external_id);
create index if not exists projects_github_url_idx on public.projects(user_id, github_url) where github_url is not null;
