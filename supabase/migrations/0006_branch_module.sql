-- Branch Management module: branches table, permissions, RLS, indexes.

-- Permissions
insert into public.permissions (key, resource, action, description) values
  ('branch:view','branch','view','View branches'),
  ('branch:create','branch','create','Create branches'),
  ('branch:update','branch','update','Update branches'),
  ('branch:delete','branch','delete','Delete branches')
on conflict (key) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r
join public.permissions p on p.key in ('branch:view','branch:create','branch:update','branch:delete')
where r.key = 'super_admin'
on conflict do nothing;

with mapping (role_key, permission_key) as (
  values
    ('admin','branch:view'),('admin','branch:create'),('admin','branch:update'),('admin','branch:delete'),
    ('hr_manager','branch:view'),('hr_manager','branch:create'),('hr_manager','branch:update'),
    ('hr_executive','branch:view')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from mapping m
join public.roles r on r.key = m.role_key
join public.permissions p on p.key = m.permission_key
on conflict do nothing;

-- branches
create table public.branches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  code text not null,
  address_line text,
  city text,
  country text not null default 'United Arab Emirates',
  phone text,
  email text,
  manager_id uuid references public.profiles (id) on delete set null,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
comment on table public.branches is 'Company branches / office locations.';

create unique index branches_company_code_active_key
  on public.branches (company_id, lower(code)) where deleted_at is null;
create index branches_company_idx on public.branches (company_id);
create index branches_status_idx on public.branches (status);
create index branches_manager_idx on public.branches (manager_id);

create trigger set_branches_updated_at before update on public.branches
  for each row execute function public.set_updated_at();

-- RLS
alter table public.branches enable row level security;

create policy "branches_select" on public.branches
  for select to authenticated using (public.has_permission('branch:view'));
create policy "branches_insert" on public.branches
  for insert to authenticated with check (public.has_permission('branch:create'));
create policy "branches_update" on public.branches
  for update to authenticated
  using (public.has_permission('branch:update'))
  with check (public.has_permission('branch:update'));

grant select, insert, update on public.branches to authenticated;
