-- Emirates ID Management module: emirates_ids table, RLS, permissions, bucket.
-- One record per issued Emirates ID (renewals create a new record; the prior
-- one is marked 'renewed'). Expiry urgency (30/60/90-day alerts) is derived
-- from expiry_date in the application layer.

create table public.emirates_ids (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  eid_number text not null,
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
create unique index emirates_ids_company_number_active_key
  on public.emirates_ids (company_id, eid_number) where deleted_at is null;
create index emirates_ids_company_idx on public.emirates_ids (company_id);
create index emirates_ids_employee_idx on public.emirates_ids (employee_id);
create index emirates_ids_expiry_idx on public.emirates_ids (expiry_date) where deleted_at is null;
create index emirates_ids_status_idx on public.emirates_ids (status);
create trigger set_emirates_ids_updated_at before update on public.emirates_ids
  for each row execute function public.set_updated_at();

-- RLS (emirates_id:view / emirates_id:manage)
alter table public.emirates_ids enable row level security;
create policy emirates_ids_select on public.emirates_ids
  for select to authenticated using (public.has_permission('emirates_id:view'));
create policy emirates_ids_insert on public.emirates_ids
  for insert to authenticated with check (public.has_permission('emirates_id:manage'));
create policy emirates_ids_update on public.emirates_ids
  for update to authenticated
  using (public.has_permission('emirates_id:manage'))
  with check (public.has_permission('emirates_id:manage'));
grant select, insert, update on public.emirates_ids to authenticated;

-- Permission catalog
insert into public.permissions (key, resource, action, description) values
  ('emirates_id:view','emirates_id','view','View Emirates IDs'),
  ('emirates_id:manage','emirates_id','manage','Manage Emirates IDs')
on conflict (key) do nothing;

-- super_admin gets every Emirates ID permission
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.key = 'super_admin' and p.resource = 'emirates_id'
on conflict do nothing;

with mapping (role_key, permission_key) as (
  values
    ('admin','emirates_id:view'),('admin','emirates_id:manage'),
    ('hr_manager','emirates_id:view'),('hr_manager','emirates_id:manage'),
    ('hr_executive','emirates_id:view')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from mapping m
join public.roles r on r.key = m.role_key
join public.permissions p on p.key = m.permission_key
on conflict do nothing;

-- Private storage bucket for Emirates ID documents (signed URLs / service role)
insert into storage.buckets (id, name, public)
values ('emirates-id-documents','emirates-id-documents', false)
on conflict (id) do nothing;
