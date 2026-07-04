-- Employee Management module: employees master + related sections, RLS, storage.
-- Reuses the seeded employee:* permissions; salary is gated by payroll:*.

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_code text not null,
  first_name text not null,
  last_name text not null,
  work_email text,
  personal_email text,
  phone text,
  gender text check (gender in ('male','female','other')),
  date_of_birth date,
  marital_status text,
  nationality text,
  department_id uuid references public.departments (id) on delete set null,
  designation_id uuid references public.designations (id) on delete set null,
  branch_id uuid references public.branches (id) on delete set null,
  employment_type_id uuid references public.employment_types (id) on delete set null,
  manager_id uuid references public.employees (id) on delete set null,
  user_id uuid references public.profiles (id) on delete set null,
  date_of_joining date,
  date_of_leaving date,
  work_location text,
  address_line text,
  city text,
  country text,
  photo_url text,
  signature_url text,
  status text not null default 'active'
    check (status in ('active','probation','on_leave','inactive','terminated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index employees_company_code_active_key
  on public.employees (company_id, lower(employee_code)) where deleted_at is null;
create index employees_company_idx on public.employees (company_id);
create index employees_department_idx on public.employees (department_id);
create index employees_status_idx on public.employees (status);
create trigger set_employees_updated_at before update on public.employees
  for each row execute function public.set_updated_at();

-- Child tables (audit columns + soft delete on each)
create table public.employee_salaries (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  effective_date date not null,
  currency text not null default 'AED',
  basic numeric(14,2) not null default 0,
  housing_allowance numeric(14,2) not null default 0,
  transport_allowance numeric(14,2) not null default 0,
  other_allowances numeric(14,2) not null default 0,
  deductions numeric(14,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index employee_salaries_employee_idx on public.employee_salaries (employee_id, effective_date desc);
create trigger set_employee_salaries_updated_at before update on public.employee_salaries
  for each row execute function public.set_updated_at();

create table public.employee_documents (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  title text not null,
  category text not null default 'document' check (category in ('document','attachment')),
  document_type text, number text, issue_date date, expiry_date date,
  file_url text, file_name text, file_size bigint, mime_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index employee_documents_employee_idx on public.employee_documents (employee_id);
create trigger set_employee_documents_updated_at before update on public.employee_documents
  for each row execute function public.set_updated_at();

create table public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  name text not null, relationship text, phone text not null, email text,
  address text, is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index emergency_contacts_employee_idx on public.emergency_contacts (employee_id);
create trigger set_emergency_contacts_updated_at before update on public.emergency_contacts
  for each row execute function public.set_updated_at();

create table public.dependents (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  name text not null, relationship text, date_of_birth date,
  gender text check (gender in ('male','female','other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index dependents_employee_idx on public.dependents (employee_id);
create trigger set_dependents_updated_at before update on public.dependents
  for each row execute function public.set_updated_at();

create table public.qualifications (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  degree text not null, institution text, field_of_study text,
  start_year smallint, end_year smallint, grade text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index qualifications_employee_idx on public.qualifications (employee_id);
create trigger set_qualifications_updated_at before update on public.qualifications
  for each row execute function public.set_updated_at();

create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  company_name text not null, job_title text, start_date date, end_date date, description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index experiences_employee_idx on public.experiences (employee_id);
create trigger set_experiences_updated_at before update on public.experiences
  for each row execute function public.set_updated_at();

create table public.employee_assets (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  name text not null, asset_tag text, category text, assigned_date date, return_date date,
  status text not null default 'assigned' check (status in ('assigned','returned')), notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index employee_assets_employee_idx on public.employee_assets (employee_id);
create trigger set_employee_assets_updated_at before update on public.employee_assets
  for each row execute function public.set_updated_at();

create table public.employee_notes (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index employee_notes_employee_idx on public.employee_notes (employee_id);
create trigger set_employee_notes_updated_at before update on public.employee_notes
  for each row execute function public.set_updated_at();

-- ============ RLS ============
alter table public.employees enable row level security;
alter table public.employee_salaries enable row level security;
alter table public.employee_documents enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.dependents enable row level security;
alter table public.qualifications enable row level security;
alter table public.experiences enable row level security;
alter table public.employee_assets enable row level security;
alter table public.employee_notes enable row level security;

create policy "employees_select" on public.employees
  for select to authenticated using (public.has_permission('employee:view'));
create policy "employees_insert" on public.employees
  for insert to authenticated with check (public.has_permission('employee:create'));
create policy "employees_update" on public.employees
  for update to authenticated using (public.has_permission('employee:update'))
  with check (public.has_permission('employee:update'));

-- Child tables gated by employee:view / employee:update
do $$
declare t text;
begin
  foreach t in array array['employee_documents','emergency_contacts','dependents',
    'qualifications','experiences','employee_assets','employee_notes'] loop
    execute format('create policy %I on public.%I for select to authenticated using (public.has_permission(''employee:view''))', t||'_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.has_permission(''employee:update''))', t||'_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.has_permission(''employee:update'')) with check (public.has_permission(''employee:update''))', t||'_update', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;
end $$;

-- Salary gated by payroll:*
create policy "employee_salaries_select" on public.employee_salaries
  for select to authenticated using (public.has_permission('payroll:view'));
create policy "employee_salaries_insert" on public.employee_salaries
  for insert to authenticated with check (public.has_permission('payroll:process'));
create policy "employee_salaries_update" on public.employee_salaries
  for update to authenticated using (public.has_permission('payroll:process'))
  with check (public.has_permission('payroll:process'));

grant select, insert, update on public.employees to authenticated;
grant select, insert, update on public.employee_salaries to authenticated;

-- ============ Storage buckets ============
insert into storage.buckets (id, name, public) values ('employee-photos', 'employee-photos', true)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('employee-documents', 'employee-documents', false)
on conflict (id) do nothing;
