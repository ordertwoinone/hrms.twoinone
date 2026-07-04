-- Passport Management module: passports table, RLS, permissions, storage bucket.
-- One record per issued passport (renewals create a new record; the prior one
-- is marked 'renewed'). Expiry urgency (30/60/90-day reminders) is derived from
-- expiry_date in the application layer.

create table public.passports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  passport_number text not null,
  nationality text not null,
  place_of_issue text,
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
create unique index passports_company_number_active_key
  on public.passports (company_id, passport_number) where deleted_at is null;
create index passports_company_idx on public.passports (company_id);
create index passports_employee_idx on public.passports (employee_id);
create index passports_expiry_idx on public.passports (expiry_date) where deleted_at is null;
create index passports_status_idx on public.passports (status);
create trigger set_passports_updated_at before update on public.passports
  for each row execute function public.set_updated_at();

-- RLS (passport:view / passport:manage)
alter table public.passports enable row level security;
create policy passports_select on public.passports
  for select to authenticated using (public.has_permission('passport:view'));
create policy passports_insert on public.passports
  for insert to authenticated with check (public.has_permission('passport:manage'));
create policy passports_update on public.passports
  for update to authenticated
  using (public.has_permission('passport:manage'))
  with check (public.has_permission('passport:manage'));
grant select, insert, update on public.passports to authenticated;

-- Permission catalog
insert into public.permissions (key, resource, action, description) values
  ('passport:view','passport','view','View passports'),
  ('passport:manage','passport','manage','Manage passports')
on conflict (key) do nothing;

-- super_admin gets every passport permission
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.key = 'super_admin' and p.resource = 'passport'
on conflict do nothing;

with mapping (role_key, permission_key) as (
  values
    ('admin','passport:view'),('admin','passport:manage'),
    ('hr_manager','passport:view'),('hr_manager','passport:manage'),
    ('hr_executive','passport:view')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from mapping m
join public.roles r on r.key = m.role_key
join public.permissions p on p.key = m.permission_key
on conflict do nothing;

-- Private storage bucket for passport documents (signed URLs / service role)
insert into storage.buckets (id, name, public)
values ('passport-documents','passport-documents', false)
on conflict (id) do nothing;
