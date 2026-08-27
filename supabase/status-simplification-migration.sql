-- ProjectOS status simplification migration
-- Keeps only: idea, development, deployed, completed

update public.projects
set status = case
  when status in ('planning','testing','paused','maintenance') then 'development'
  when status = 'archived' then 'completed'
  when status = 'cancelled' then 'idea'
  else status
end
where status not in ('idea','development','deployed','completed');

alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects
  add constraint projects_status_check
  check (status in ('idea','development','deployed','completed'));
