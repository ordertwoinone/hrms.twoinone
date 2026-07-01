-- Employment Types module: employment_types table, permissions, RLS, indexes,
-- and the 5 default system types for the existing company.

-- Permissions
insert into public.permissions (key, resource, action, description) values
  ('employment_type:view','employment_type','view','View employment types'),
  ('employment_type:manage','employment_type','manage','Manage employment types')
on conflict (key) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r
join public.permissions p on p.key in ('employment_type:view','employment_type:manage')
where r.key = 'super_admin'
on conflict do nothing;

with mapping (role_key, permission_key) as (
  values
    ('admin','employment_type:view'),('admin','employment_type:manage'),
    ('hr_manager','employment_type:view'),('hr_manager','employment_type:manage'),
    ('hr_executive','employment_type:view'),
    ('department_manager','employment_type:view')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from mapping m
join public.roles r on r.key = m.role_key
join public.permissions p on p.key = m.permission_key
on conflict do nothing;

-- Table
create table public.employment_types (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active','inactive')),
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
comment on table public.employment_types is 'Employment types (Permanent, Contract, …) — system defaults plus custom.';

create unique index employment_types_company_name_active_key
  on public.employment_types (company_id, lower(name)) where deleted_at is null;
create index employment_types_company_idx on public.employment_types (company_id);
create index employment_types_status_idx on public.employment_types (status);

create trigger set_employment_types_updated_at before update on public.employment_types
  for each row execute function public.set_updated_at();

-- RLS
alter table public.employment_types enable row level security;

create policy "employment_types_select" on public.employment_types
  for select to authenticated using (public.has_permission('employment_type:view'));
create policy "employment_types_insert" on public.employment_types
  for insert to authenticated with check (public.has_permission('employment_type:manage'));
create policy "employment_types_update" on public.employment_types
  for update to authenticated
  using (public.has_permission('employment_type:manage'))
  with check (public.has_permission('employment_type:manage'));

grant select, insert, update on public.employment_types to authenticated;

-- Seed the 5 default (system) types for the existing company
insert into public.employment_types (company_id, name, description, is_system)
select c.id, v.name, v.description, true
from (
  select id from public.companies where deleted_at is null order by created_at asc limit 1
) c
cross join (values
  ('Permanent','Full-time permanent employment.'),
  ('Contract','Fixed-term contract employment.'),
  ('Temporary','Short-term temporary employment.'),
  ('Internship','Internship or trainee position.'),
  ('Probation','Probationary period employment.')
) as v(name, description)
on conflict do nothing;
