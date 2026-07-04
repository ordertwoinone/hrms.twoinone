-- Payroll Config & System Preferences module.
-- Tables: payroll_config (singleton per company), system_preferences (singleton per company)

create table public.payroll_config (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies (id) on delete cascade,
  -- Overtime rates (multiples of hourly rate)
  overtime_rate_weekday numeric(4,2) not null default 1.25,
  overtime_rate_weekend numeric(4,2) not null default 1.50,
  overtime_rate_holiday numeric(4,2) not null default 2.00,
  -- UAE WPS details
  agent_id text,
  employer_id text,
  bank_routing_code text,
  -- Allowances (monthly fixed amounts in AED)
  housing_allowance numeric(12,2) not null default 0,
  transport_allowance numeric(12,2) not null default 0,
  meal_allowance numeric(12,2) not null default 0,
  other_allowance numeric(12,2) not null default 0,
  -- Deductions
  social_security_employee_pct numeric(5,2) not null default 0,
  social_security_employer_pct numeric(5,2) not null default 0,
  -- Gratuity (UAE Labor Law)
  gratuity_enabled boolean not null default true,
  gratuity_5yr_rate numeric(5,2) not null default 21, -- days per year for first 5 years
  gratuity_5yr_plus_rate numeric(5,2) not null default 30, -- days per year after 5 years
  -- Payroll run settings
  payroll_day int not null default 25 check (payroll_day between 1 and 28),
  currency text not null default 'AED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
create trigger set_payroll_config_updated_at before update on public.payroll_config
  for each row execute function public.set_updated_at();

create table public.system_preferences (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies (id) on delete cascade,
  -- Locale
  timezone text not null default 'Asia/Dubai',
  date_format text not null default 'DD/MM/YYYY',
  time_format text not null default '12h',
  language text not null default 'en',
  -- Financial year
  fiscal_year_start_month int not null default 1 check (fiscal_year_start_month between 1 and 12),
  -- Work week
  work_week_start text not null default 'sunday' check (work_week_start in ('sunday','monday')),
  work_days text[] not null default array['sunday','monday','tuesday','wednesday','thursday'],
  -- Features toggles
  enable_self_service boolean not null default true,
  enable_overtime_module boolean not null default true,
  enable_recruitment_module boolean not null default true,
  enable_performance_module boolean not null default true,
  enable_training_module boolean not null default true,
  -- Email notifications
  notify_leave_approval boolean not null default true,
  notify_contract_expiry boolean not null default true,
  notify_document_expiry boolean not null default true,
  notify_birthday boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
create trigger set_system_preferences_updated_at before update on public.system_preferences
  for each row execute function public.set_updated_at();

-- RLS
alter table public.payroll_config enable row level security;
alter table public.system_preferences enable row level security;

create policy payroll_config_select on public.payroll_config
  for select to authenticated using (public.has_permission('payroll:view') or public.has_permission('settings:view'));
create policy payroll_config_insert on public.payroll_config
  for insert to authenticated with check (public.has_permission('settings:manage'));
create policy payroll_config_update on public.payroll_config
  for update to authenticated using (public.has_permission('settings:manage')) with check (public.has_permission('settings:manage'));

create policy system_preferences_select on public.system_preferences
  for select to authenticated using (public.has_permission('settings:view'));
create policy system_preferences_insert on public.system_preferences
  for insert to authenticated with check (public.has_permission('settings:manage'));
create policy system_preferences_update on public.system_preferences
  for update to authenticated using (public.has_permission('settings:manage')) with check (public.has_permission('settings:manage'));

grant select, insert, update on public.payroll_config to authenticated;
grant select, insert, update on public.system_preferences to authenticated;

-- Seed defaults for the first company
insert into public.payroll_config (company_id)
select id from public.companies where deleted_at is null order by created_at limit 1
on conflict (company_id) do nothing;

insert into public.system_preferences (company_id)
select id from public.companies where deleted_at is null order by created_at limit 1
on conflict (company_id) do nothing;
