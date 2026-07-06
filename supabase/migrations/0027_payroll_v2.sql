-- Payroll v2: enterprise UAE enhancements.
-- Adds food/telephone allowances, OT multiplier, SS contributions to employee_salaries.
-- Extends payslips with attendance-aware columns.
-- Adds: bank_accounts, loan_payments, salary_advances, advance_repayments, bonuses, payroll_approvals.
-- New permissions: salary:*, loan:*, advance:*, bonus:* (view + manage).

-- ── 1. Enhance employee_salaries ─────────────────────────────────────────────
alter table public.employee_salaries
  add column if not exists food_allowance                 numeric(12,2) not null default 0,
  add column if not exists telephone_allowance            numeric(12,2) not null default 0,
  add column if not exists commission_fixed               numeric(12,2) not null default 0,
  add column if not exists overtime_rate_multiplier       numeric(4,2)  not null default 1.25,
  add column if not exists social_security_employee_pct  numeric(5,4)  not null default 0,
  add column if not exists social_security_employer_pct  numeric(5,4)  not null default 0;

-- ── 2. Enhance payslips ──────────────────────────────────────────────────────
alter table public.payslips
  add column if not exists food_allowance            numeric(12,2) not null default 0,
  add column if not exists telephone_allowance       numeric(12,2) not null default 0,
  add column if not exists advance_deduction         numeric(12,2) not null default 0,
  add column if not exists penalty                   numeric(12,2) not null default 0,
  add column if not exists working_days              integer       not null default 0,
  add column if not exists present_days              integer       not null default 0,
  add column if not exists absent_days               integer       not null default 0,
  add column if not exists ot_hours                  numeric(6,2)  not null default 0,
  add column if not exists ot_amount                 numeric(12,2) not null default 0,
  add column if not exists social_security_employee  numeric(12,2) not null default 0,
  add column if not exists social_security_employer  numeric(12,2) not null default 0,
  add column if not exists leave_encashment          numeric(12,2) not null default 0;

-- ── 3. Enhance payroll_runs ──────────────────────────────────────────────────
alter table public.payroll_runs
  add column if not exists locked_at timestamptz,
  add column if not exists locked_by uuid references auth.users(id) on delete set null;

-- ── 4. bank_accounts ─────────────────────────────────────────────────────────
create table if not exists public.bank_accounts (
  id                  uuid primary key default gen_random_uuid(),
  company_id          uuid not null references public.companies(id) on delete cascade,
  employee_id         uuid not null references public.employees(id) on delete cascade,
  bank_name           text not null,
  account_number      text not null,
  iban                text not null,
  account_holder_name text not null,
  currency            text not null default 'AED',
  is_primary          boolean not null default false,
  status              text not null default 'active'
    check (status in ('active','inactive')),
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz,
  created_by          uuid references auth.users(id) on delete set null,
  updated_by          uuid references auth.users(id) on delete set null
);

create index if not exists bank_accounts_employee_idx on public.bank_accounts(employee_id);
create trigger set_bank_accounts_updated_at before update on public.bank_accounts
  for each row execute function public.set_updated_at();
alter table public.bank_accounts enable row level security;

-- ── 5. loan_payments ─────────────────────────────────────────────────────────
create table if not exists public.loan_payments (
  id              uuid primary key default gen_random_uuid(),
  loan_id         uuid not null references public.employee_loans(id) on delete cascade,
  payroll_run_id  uuid references public.payroll_runs(id) on delete set null,
  amount          numeric(12,2) not null check (amount > 0),
  payment_date    date not null,
  payment_method  text not null default 'salary_deduction'
    check (payment_method in ('salary_deduction','cash','bank_transfer')),
  notes           text,
  created_at      timestamptz not null default now(),
  created_by      uuid references auth.users(id) on delete set null
);

create index if not exists loan_payments_loan_idx on public.loan_payments(loan_id);
alter table public.loan_payments enable row level security;

-- ── 6. salary_advances ───────────────────────────────────────────────────────
create table if not exists public.salary_advances (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references public.companies(id) on delete cascade,
  employee_id       uuid not null references public.employees(id) on delete cascade,
  amount            numeric(12,2) not null check (amount > 0),
  advance_date      date not null,
  repayment_months  integer not null default 1 check (repayment_months between 1 and 24),
  monthly_deduction numeric(12,2) not null default 0,
  outstanding       numeric(12,2) not null default 0,
  reason            text,
  status            text not null default 'pending'
    check (status in ('pending','approved','active','closed','rejected','cancelled')),
  approved_by       uuid references auth.users(id) on delete set null,
  approved_at       timestamptz,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz,
  created_by        uuid references auth.users(id) on delete set null,
  updated_by        uuid references auth.users(id) on delete set null
);

create index if not exists salary_advances_employee_idx on public.salary_advances(employee_id);
create index if not exists salary_advances_status_idx   on public.salary_advances(status);
create trigger set_salary_advances_updated_at before update on public.salary_advances
  for each row execute function public.set_updated_at();
alter table public.salary_advances enable row level security;

-- ── 7. advance_repayments ────────────────────────────────────────────────────
create table if not exists public.advance_repayments (
  id              uuid primary key default gen_random_uuid(),
  advance_id      uuid not null references public.salary_advances(id) on delete cascade,
  payroll_run_id  uuid references public.payroll_runs(id) on delete set null,
  amount          numeric(12,2) not null check (amount > 0),
  repayment_date  date not null,
  notes           text,
  created_at      timestamptz not null default now(),
  created_by      uuid references auth.users(id) on delete set null
);

create index if not exists advance_repayments_advance_idx on public.advance_repayments(advance_id);
alter table public.advance_repayments enable row level security;

-- ── 8. bonuses ───────────────────────────────────────────────────────────────
create table if not exists public.bonuses (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references public.companies(id) on delete cascade,
  employee_id     uuid not null references public.employees(id) on delete cascade,
  payroll_run_id  uuid references public.payroll_runs(id) on delete set null,
  bonus_type      text not null
    check (bonus_type in ('performance','annual','festival','referral','retention','spot','other')),
  amount          numeric(12,2) not null check (amount > 0),
  effective_month integer check (effective_month between 1 and 12),
  effective_year  integer check (effective_year between 2000 and 2100),
  description     text,
  status          text not null default 'pending'
    check (status in ('pending','approved','paid','cancelled')),
  approved_by     uuid references auth.users(id) on delete set null,
  approved_at     timestamptz,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  created_by      uuid references auth.users(id) on delete set null,
  updated_by      uuid references auth.users(id) on delete set null
);

create index if not exists bonuses_employee_idx on public.bonuses(employee_id);
create index if not exists bonuses_status_idx   on public.bonuses(status);
create trigger set_bonuses_updated_at before update on public.bonuses
  for each row execute function public.set_updated_at();
alter table public.bonuses enable row level security;

-- ── 9. payroll_approvals ─────────────────────────────────────────────────────
create table if not exists public.payroll_approvals (
  id              uuid primary key default gen_random_uuid(),
  payroll_run_id  uuid not null references public.payroll_runs(id) on delete cascade,
  level           integer not null check (level between 1 and 5),
  approver_id     uuid not null references auth.users(id) on delete cascade,
  status          text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  remarks         text,
  actioned_at     timestamptz,
  created_at      timestamptz not null default now(),
  unique(payroll_run_id, level)
);

create index if not exists payroll_approvals_run_idx on public.payroll_approvals(payroll_run_id);
alter table public.payroll_approvals enable row level security;

-- ── 10. New permissions ──────────────────────────────────────────────────────
insert into public.permissions (key, resource, action, description) values
  ('salary:view',    'salary',  'view',   'View employee salary structures'),
  ('salary:manage',  'salary',  'manage', 'Create and update employee salary structures'),
  ('loan:view',      'loan',    'view',   'View employee loans'),
  ('loan:manage',    'loan',    'manage', 'Create and manage employee loans'),
  ('advance:view',   'advance', 'view',   'View salary advance requests'),
  ('advance:manage', 'advance', 'manage', 'Manage salary advance requests'),
  ('bonus:view',     'bonus',   'view',   'View employee bonuses'),
  ('bonus:manage',   'bonus',   'manage', 'Create and approve employee bonuses')
on conflict (key) do nothing;

-- ── 11. Role → permission grants ─────────────────────────────────────────────
with mapping (role_key, permission_key) as (
  values
    ('super_admin','salary:view'),   ('super_admin','salary:manage'),
    ('super_admin','loan:view'),     ('super_admin','loan:manage'),
    ('super_admin','advance:view'),  ('super_admin','advance:manage'),
    ('super_admin','bonus:view'),    ('super_admin','bonus:manage'),
    ('admin','salary:view'),         ('admin','salary:manage'),
    ('admin','loan:view'),           ('admin','loan:manage'),
    ('admin','advance:view'),        ('admin','advance:manage'),
    ('admin','bonus:view'),          ('admin','bonus:manage'),
    ('finance','salary:view'),       ('finance','salary:manage'),
    ('finance','loan:view'),         ('finance','loan:manage'),
    ('finance','advance:view'),      ('finance','advance:manage'),
    ('finance','bonus:view'),        ('finance','bonus:manage'),
    ('hr_manager','salary:view'),
    ('hr_manager','loan:view'),
    ('hr_manager','advance:view'),
    ('hr_manager','bonus:view'),
    ('hr_executive','salary:view'),
    ('hr_executive','loan:view'),
    ('hr_executive','advance:view'),
    ('hr_executive','bonus:view')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from mapping m
join public.roles r on r.key = m.role_key
join public.permissions p on p.key = m.permission_key
on conflict do nothing;

-- ── 12. RLS policies (admin client bypasses these; policies protect direct DB access) ──
do $$
declare t text;
begin
  -- bank_accounts: salary:view read, salary:manage write
  execute 'create policy bank_accounts_select on public.bank_accounts
    for select to authenticated using (public.has_permission(''salary:view''))';
  execute 'create policy bank_accounts_insert on public.bank_accounts
    for insert to authenticated with check (public.has_permission(''salary:manage''))';
  execute 'create policy bank_accounts_update on public.bank_accounts
    for update to authenticated using (public.has_permission(''salary:manage''))
    with check (public.has_permission(''salary:manage''))';
  execute 'grant select, insert, update on public.bank_accounts to authenticated';

  -- loan_payments: loan:view read, loan:manage write
  execute 'create policy loan_payments_select on public.loan_payments
    for select to authenticated using (public.has_permission(''loan:view''))';
  execute 'create policy loan_payments_insert on public.loan_payments
    for insert to authenticated with check (public.has_permission(''loan:manage''))';
  execute 'grant select, insert on public.loan_payments to authenticated';

  -- salary_advances: advance:view read, advance:manage write
  foreach t in array array['salary_advances'] loop
    execute format('create policy %I on public.%I
      for select to authenticated using (public.has_permission(''advance:view''))', t||'_select', t);
    execute format('create policy %I on public.%I
      for insert to authenticated with check (public.has_permission(''advance:manage''))', t||'_insert', t);
    execute format('create policy %I on public.%I
      for update to authenticated using (public.has_permission(''advance:manage''))
      with check (public.has_permission(''advance:manage''))', t||'_update', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;

  -- advance_repayments: same as advance
  execute 'create policy advance_repayments_select on public.advance_repayments
    for select to authenticated using (public.has_permission(''advance:view''))';
  execute 'create policy advance_repayments_insert on public.advance_repayments
    for insert to authenticated with check (public.has_permission(''advance:manage''))';
  execute 'grant select, insert on public.advance_repayments to authenticated';

  -- bonuses: bonus:view read, bonus:manage write
  foreach t in array array['bonuses'] loop
    execute format('create policy %I on public.%I
      for select to authenticated using (public.has_permission(''bonus:view''))', t||'_select', t);
    execute format('create policy %I on public.%I
      for insert to authenticated with check (public.has_permission(''bonus:manage''))', t||'_insert', t);
    execute format('create policy %I on public.%I
      for update to authenticated using (public.has_permission(''bonus:manage''))
      with check (public.has_permission(''bonus:manage''))', t||'_update', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;

  -- payroll_approvals: payroll:view read, payroll:approve write
  execute 'create policy payroll_approvals_select on public.payroll_approvals
    for select to authenticated using (public.has_permission(''payroll:view''))';
  execute 'create policy payroll_approvals_insert on public.payroll_approvals
    for insert to authenticated with check (public.has_permission(''payroll:approve''))';
  execute 'create policy payroll_approvals_update on public.payroll_approvals
    for update to authenticated using (public.has_permission(''payroll:approve''))
    with check (public.has_permission(''payroll:approve''))';
  execute 'grant select, insert, update on public.payroll_approvals to authenticated';
end $$;
