-- Medical Insurance Management module: medical_insurance_policies table, RLS,
-- permissions, storage bucket. One record per policy period (renewals create a
-- new record; the prior one is marked 'renewed'). Expiry urgency (30/60/90-day
-- renewal reminders) is derived from expiry_date in the application layer.

create table public.medical_insurance_policies (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  provider text not null,
  policy_number text not null,
  coverage text not null,
  dependents_covered int not null default 0
    check (dependents_covered >= 0 and dependents_covered <= 50),
  issue_date date not null,
  expiry_date date not null,
  renewal_date date,
  status text not null default 'active'
    check (status in ('active','in_process','renewed','cancelled','expired')),
  claims_notes text,
  attachment_url text,
  attachment_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index medical_insurance_company_policy_active_key
  on public.medical_insurance_policies (company_id, policy_number)
  where deleted_at is null;
create index medical_insurance_company_idx on public.medical_insurance_policies (company_id);
create index medical_insurance_employee_idx on public.medical_insurance_policies (employee_id);
create index medical_insurance_expiry_idx on public.medical_insurance_policies (expiry_date) where deleted_at is null;
create index medical_insurance_status_idx on public.medical_insurance_policies (status);
create trigger set_medical_insurance_updated_at before update on public.medical_insurance_policies
  for each row execute function public.set_updated_at();

-- RLS (medical_insurance:view / medical_insurance:manage)
alter table public.medical_insurance_policies enable row level security;
create policy medical_insurance_select on public.medical_insurance_policies
  for select to authenticated using (public.has_permission('medical_insurance:view'));
create policy medical_insurance_insert on public.medical_insurance_policies
  for insert to authenticated with check (public.has_permission('medical_insurance:manage'));
create policy medical_insurance_update on public.medical_insurance_policies
  for update to authenticated
  using (public.has_permission('medical_insurance:manage'))
  with check (public.has_permission('medical_insurance:manage'));
grant select, insert, update on public.medical_insurance_policies to authenticated;

-- Permission catalog
insert into public.permissions (key, resource, action, description) values
  ('medical_insurance:view','medical_insurance','view','View medical insurance'),
  ('medical_insurance:manage','medical_insurance','manage','Manage medical insurance')
on conflict (key) do nothing;

-- super_admin gets every medical insurance permission
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.key = 'super_admin' and p.resource = 'medical_insurance'
on conflict do nothing;

with mapping (role_key, permission_key) as (
  values
    ('admin','medical_insurance:view'),('admin','medical_insurance:manage'),
    ('hr_manager','medical_insurance:view'),('hr_manager','medical_insurance:manage'),
    ('hr_executive','medical_insurance:view')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from mapping m
join public.roles r on r.key = m.role_key
join public.permissions p on p.key = m.permission_key
on conflict do nothing;

-- Private storage bucket for policy documents (signed URLs / service role)
insert into storage.buckets (id, name, public)
values ('medical-insurance-documents','medical-insurance-documents', false)
on conflict (id) do nothing;
