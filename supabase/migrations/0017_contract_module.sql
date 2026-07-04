-- Contract Management module: contracts + contract_events, RLS, permissions,
-- storage bucket. Tracks offer letter + employment contract documents, contract
-- lifecycle, an approval workflow (draft → pending → active), and expiry
-- reminders derived from end_date.

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  contract_type text not null,
  start_date date not null,
  end_date date,
  notice_period_days int not null default 30
    check (notice_period_days >= 0 and notice_period_days <= 365),
  renewal_date date,
  status text not null default 'draft'
    check (status in ('draft','pending','active','expired','terminated','renewed')),
  offer_letter_url text,
  offer_letter_name text,
  contract_url text,
  contract_name text,
  attachment_url text,
  attachment_name text,
  submitted_at timestamptz,
  approved_by uuid references auth.users (id) on delete set null,
  approved_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index contracts_company_idx on public.contracts (company_id);
create index contracts_employee_idx on public.contracts (employee_id);
create index contracts_end_date_idx on public.contracts (end_date) where deleted_at is null;
create index contracts_status_idx on public.contracts (status);
create trigger set_contracts_updated_at before update on public.contracts
  for each row execute function public.set_updated_at();

create table public.contract_events (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  note text,
  created_at timestamptz not null default now()
);
create index contract_events_contract_idx on public.contract_events (contract_id);

-- RLS (contract:view / contract:manage / contract:approve)
alter table public.contracts enable row level security;
alter table public.contract_events enable row level security;
create policy contracts_select on public.contracts
  for select to authenticated using (public.has_permission('contract:view'));
create policy contracts_insert on public.contracts
  for insert to authenticated with check (public.has_permission('contract:manage'));
create policy contracts_update on public.contracts
  for update to authenticated
  using (public.has_permission('contract:manage') or public.has_permission('contract:approve'))
  with check (public.has_permission('contract:manage') or public.has_permission('contract:approve'));
create policy contract_events_select on public.contract_events
  for select to authenticated using (public.has_permission('contract:view'));
create policy contract_events_insert on public.contract_events
  for insert to authenticated with check (public.has_permission('contract:manage') or public.has_permission('contract:approve'));
grant select, insert, update on public.contracts to authenticated;
grant select, insert on public.contract_events to authenticated;

-- Permission catalog
insert into public.permissions (key, resource, action, description) values
  ('contract:view','contract','view','View contracts'),
  ('contract:manage','contract','manage','Manage contracts'),
  ('contract:approve','contract','approve','Approve contracts')
on conflict (key) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.key = 'super_admin' and p.resource = 'contract'
on conflict do nothing;

with mapping (role_key, permission_key) as (
  values
    ('admin','contract:view'),('admin','contract:manage'),('admin','contract:approve'),
    ('hr_manager','contract:view'),('hr_manager','contract:manage'),('hr_manager','contract:approve'),
    ('hr_executive','contract:view'),('hr_executive','contract:manage'),
    ('department_manager','contract:view')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from mapping m
join public.roles r on r.key = m.role_key
join public.permissions p on p.key = m.permission_key
on conflict do nothing;

-- Private storage bucket for contract documents (signed URLs / service role)
insert into storage.buckets (id, name, public)
values ('contract-documents','contract-documents', false)
on conflict (id) do nothing;
