-- Designation Management module: designations table, permissions, RLS, indexes.

-- Permissions
insert into public.permissions (key, resource, action, description) values
  ('designation:view','designation','view','View designations'),
  ('designation:manage','designation','manage','Manage designations')
on conflict (key) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r
join public.permissions p on p.key in ('designation:view','designation:manage')
where r.key = 'super_admin'
on conflict do nothing;

with mapping (role_key, permission_key) as (
  values
    ('admin','designation:view'),('admin','designation:manage'),
    ('hr_manager','designation:view'),('hr_manager','designation:manage'),
    ('hr_executive','designation:view'),
    ('department_manager','designation:view')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from mapping m
join public.roles r on r.key = m.role_key
join public.permissions p on p.key = m.permission_key
on conflict do nothing;

-- designations
create table public.designations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  department_id uuid references public.departments (id) on delete set null,
  name text not null,
  grade text,
  description text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
comment on table public.designations is 'Job designations / titles, optionally tied to a department.';

-- Unique name per (company, department) among live rows; the coalesce sentinel
-- keeps the "no department" case consistent (NULLs would otherwise be distinct).
create unique index designations_company_dept_name_active_key
  on public.designations (
    company_id,
    coalesce(department_id, '00000000-0000-0000-0000-000000000000'::uuid),
    lower(name)
  )
  where deleted_at is null;
create index designations_company_idx on public.designations (company_id);
create index designations_department_idx on public.designations (department_id);
create index designations_status_idx on public.designations (status);

create trigger set_designations_updated_at before update on public.designations
  for each row execute function public.set_updated_at();

-- RLS
alter table public.designations enable row level security;

create policy "designations_select" on public.designations
  for select to authenticated using (public.has_permission('designation:view'));
create policy "designations_insert" on public.designations
  for insert to authenticated with check (public.has_permission('designation:manage'));
create policy "designations_update" on public.designations
  for update to authenticated
  using (public.has_permission('designation:manage'))
  with check (public.has_permission('designation:manage'));

grant select, insert, update on public.designations to authenticated;
