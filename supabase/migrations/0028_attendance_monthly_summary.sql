-- Monthly attendance summary: per-employee/month customizable absent days,
-- absent deduction, additional duty hours, and additional duty payment.
-- Presence of a row for an employee/period overrides payroll's auto-calculated
-- absence deduction and OT amount for that employee/month.

create table public.attendance_monthly_summary (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  period_year int not null check (period_year between 2000 and 2100),
  period_month int not null check (period_month between 1 and 12),
  absent_days numeric(5,2) not null default 0 check (absent_days >= 0),
  absent_deduction numeric(12,2) not null default 0 check (absent_deduction >= 0),
  additional_duty_hours numeric(6,2) not null default 0 check (additional_duty_hours >= 0),
  additional_duty_payment numeric(12,2) not null default 0 check (additional_duty_payment >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index attendance_monthly_summary_employee_period_key
  on public.attendance_monthly_summary (employee_id, period_year, period_month) where deleted_at is null;
create index attendance_monthly_summary_company_period_idx
  on public.attendance_monthly_summary (company_id, period_year, period_month);
create trigger set_attendance_monthly_summary_updated_at before update on public.attendance_monthly_summary
  for each row execute function public.set_updated_at();

alter table public.attendance_monthly_summary enable row level security;

create policy attendance_monthly_summary_select on public.attendance_monthly_summary
  for select to authenticated using (public.has_permission('attendance:view'));
create policy attendance_monthly_summary_insert on public.attendance_monthly_summary
  for insert to authenticated with check (public.has_permission('attendance:manage'));
create policy attendance_monthly_summary_update on public.attendance_monthly_summary
  for update to authenticated using (public.has_permission('attendance:manage'))
  with check (public.has_permission('attendance:manage'));

grant select, insert, update on public.attendance_monthly_summary to authenticated;
