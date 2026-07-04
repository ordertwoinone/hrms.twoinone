-- Payroll module: employee_loans, payroll_runs, payslips. Salary structure and
-- revisions reuse the existing employee_salaries table (latest effective_date =
-- current structure). Adds a payroll:approve permission for the approval step.

-- Employee loans (salary advances etc.); monthly_deduction feeds payslips.
create table public.employee_loans (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  loan_type text not null default 'Salary Advance',
  principal numeric(12,2) not null check (principal >= 0),
  monthly_deduction numeric(12,2) not null check (monthly_deduction >= 0),
  outstanding numeric(12,2) not null check (outstanding >= 0),
  start_date date not null,
  status text not null default 'active' check (status in ('active','closed','cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index employee_loans_employee_idx on public.employee_loans (employee_id);
create index employee_loans_status_idx on public.employee_loans (status);
create trigger set_employee_loans_updated_at before update on public.employee_loans
  for each row execute function public.set_updated_at();

-- Monthly payroll runs with an approval workflow.
create table public.payroll_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  period_year int not null check (period_year between 2000 and 2100),
  period_month int not null check (period_month between 1 and 12),
  status text not null default 'draft'
    check (status in ('draft','pending','approved','paid','cancelled')),
  currency text not null default 'AED',
  total_gross numeric(14,2) not null default 0,
  total_deductions numeric(14,2) not null default 0,
  total_net numeric(14,2) not null default 0,
  employee_count int not null default 0,
  notes text,
  approved_by uuid references auth.users (id) on delete set null,
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index payroll_runs_period_active_key
  on public.payroll_runs (company_id, period_year, period_month)
  where deleted_at is null;
create index payroll_runs_status_idx on public.payroll_runs (status);
create trigger set_payroll_runs_updated_at before update on public.payroll_runs
  for each row execute function public.set_updated_at();

-- Individual payslips within a run.
create table public.payslips (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.payroll_runs (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  basic numeric(12,2) not null default 0,
  housing_allowance numeric(12,2) not null default 0,
  transport_allowance numeric(12,2) not null default 0,
  other_allowances numeric(12,2) not null default 0,
  overtime numeric(12,2) not null default 0,
  bonus numeric(12,2) not null default 0,
  commission numeric(12,2) not null default 0,
  gross numeric(12,2) not null default 0,
  deductions numeric(12,2) not null default 0,
  loan_deduction numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  net numeric(12,2) not null default 0,
  currency text not null default 'AED',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index payslips_run_employee_key on public.payslips (run_id, employee_id);
create index payslips_employee_idx on public.payslips (employee_id);
create trigger set_payslips_updated_at before update on public.payslips
  for each row execute function public.set_updated_at();

-- RLS: reuse payroll:view (read) and payroll:process (write); approval via payroll:approve.
alter table public.employee_loans enable row level security;
alter table public.payroll_runs enable row level security;
alter table public.payslips enable row level security;

do $$
declare t text;
begin
  foreach t in array array['employee_loans','payroll_runs','payslips'] loop
    execute format('create policy %I on public.%I for select to authenticated using (public.has_permission(''payroll:view''))', t||'_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.has_permission(''payroll:process''))', t||'_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.has_permission(''payroll:process'') or public.has_permission(''payroll:approve'')) with check (public.has_permission(''payroll:process'') or public.has_permission(''payroll:approve''))', t||'_update', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;
end $$;

-- New approval permission
insert into public.permissions (key, resource, action, description) values
  ('payroll:approve','payroll','approve','Approve payroll runs')
on conflict (key) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.key = 'super_admin' and p.key = 'payroll:approve'
on conflict do nothing;

with mapping (role_key, permission_key) as (
  values
    ('admin','payroll:approve'),
    ('hr_manager','payroll:approve'),
    ('finance','payroll:approve')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from mapping m
join public.roles r on r.key = m.role_key
join public.permissions p on p.key = m.permission_key
on conflict do nothing;
