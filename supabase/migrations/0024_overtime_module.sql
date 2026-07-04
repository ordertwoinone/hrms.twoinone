-- Overtime Management module.
-- Table: overtime_requests

create table public.overtime_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  hours_requested numeric(5,2) not null,
  reason text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  -- First level: department manager
  manager_id uuid references public.employees (id) on delete set null,
  manager_status text check (manager_status in ('pending','approved','rejected')),
  manager_remarks text,
  manager_reviewed_at timestamptz,
  -- Second level: HR
  hr_id uuid references auth.users (id) on delete set null,
  hr_status text check (hr_status in ('pending','approved','rejected')),
  hr_remarks text,
  hr_reviewed_at timestamptz,
  -- Payroll linkage
  payroll_run_id uuid references public.payroll_runs (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index overtime_requests_employee_idx on public.overtime_requests (employee_id);
create index overtime_requests_company_idx on public.overtime_requests (company_id, status);
create trigger set_overtime_requests_updated_at before update on public.overtime_requests
  for each row execute function public.set_updated_at();

-- Permissions
insert into public.permissions (key, resource, action, description)
values
  ('overtime:view',    'overtime', 'view',    'View overtime requests'),
  ('overtime:approve', 'overtime', 'approve', 'Approve or reject overtime requests'),
  ('overtime:manage',  'overtime', 'manage',  'Create, edit, cancel overtime requests')
on conflict (key) do nothing;

-- RLS: employees see own requests; managers/HR see all
alter table public.overtime_requests enable row level security;

create policy overtime_requests_select on public.overtime_requests
  for select to authenticated
  using (
    public.has_permission('overtime:view')
    or employee_id in (
      select id from public.employees where user_id = auth.uid() and deleted_at is null
    )
  );

create policy overtime_requests_insert on public.overtime_requests
  for insert to authenticated
  with check (public.has_permission('overtime:manage'));

create policy overtime_requests_update on public.overtime_requests
  for update to authenticated
  using (public.has_permission('overtime:approve') or public.has_permission('overtime:manage'))
  with check (public.has_permission('overtime:approve') or public.has_permission('overtime:manage'));

grant select, insert, update on public.overtime_requests to authenticated;
