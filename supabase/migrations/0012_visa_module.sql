-- UAE Visa Management module: visas table, RLS, permissions, storage bucket.
-- A visa is issued to an employee against a passport, by a sponsor, and has a
-- lifecycle driven by issue/expiry/renewal dates. Expiry urgency (30/60/90-day
-- alerts) is derived from expiry_date in the application layer.

create table public.visas (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  visa_number text not null,
  visa_type text not null,
  sponsor text,
  passport_number text,
  issue_date date not null,
  expiry_date date not null,
  renewal_date date,
  status text not null default 'active'
    check (status in ('active','in_process','renewed','cancelled','expired')),
  attachment_url text,
  attachment_name text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index visas_company_number_active_key
  on public.visas (company_id, lower(visa_number)) where deleted_at is null;
create index visas_company_idx on public.visas (company_id);
create index visas_employee_idx on public.visas (employee_id);
create index visas_expiry_idx on public.visas (expiry_date) where deleted_at is null;
create index visas_status_idx on public.visas (status);
create trigger set_visas_updated_at before update on public.visas
  for each row execute function public.set_updated_at();

-- RLS (visa:view / visa:manage)
alter table public.visas enable row level security;
create policy visas_select on public.visas
  for select to authenticated using (public.has_permission('visa:view'));
create policy visas_insert on public.visas
  for insert to authenticated with check (public.has_permission('visa:manage'));
create policy visas_update on public.visas
  for update to authenticated
  using (public.has_permission('visa:manage'))
  with check (public.has_permission('visa:manage'));
grant select, insert, update on public.visas to authenticated;

-- Permission catalog
insert into public.permissions (key, resource, action, description) values
  ('visa:view','visa','view','View visas'),
  ('visa:manage','visa','manage','Manage visas')
on conflict (key) do nothing;

-- super_admin gets every visa permission
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.key = 'super_admin' and p.resource = 'visa'
on conflict do nothing;

with mapping (role_key, permission_key) as (
  values
    ('admin','visa:view'),('admin','visa:manage'),
    ('hr_manager','visa:view'),('hr_manager','visa:manage'),
    ('hr_executive','visa:view')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from mapping m
join public.roles r on r.key = m.role_key
join public.permissions p on p.key = m.permission_key
on conflict do nothing;

-- Private storage bucket for visa documents (access via signed URLs / service role)
insert into storage.buckets (id, name, public)
values ('visa-documents','visa-documents', false)
on conflict (id) do nothing;
