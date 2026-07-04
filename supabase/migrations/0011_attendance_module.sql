-- Attendance module foundation: shifts, attendance, attendance_corrections.
-- Reuses the seeded attendance:view / attendance:manage permissions.

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  code text not null,
  start_time time not null,
  end_time time not null,
  break_minutes int not null default 0,
  grace_minutes int not null default 0,
  is_night boolean not null default false,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index shifts_company_code_active_key
  on public.shifts (company_id, lower(code)) where deleted_at is null;
create index shifts_company_idx on public.shifts (company_id);
create trigger set_shifts_updated_at before update on public.shifts
  for each row execute function public.set_updated_at();

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  shift_id uuid references public.shifts (id) on delete set null,
  attendance_date date not null,
  check_in timestamptz,
  check_out timestamptz,
  status text not null default 'present'
    check (status in ('present','absent','late','half_day','on_leave','holiday','weekend')),
  work_minutes int not null default 0,
  late_minutes int not null default 0,
  early_leave_minutes int not null default 0,
  overtime_minutes int not null default 0,
  break_minutes int not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index attendance_employee_date_active_key
  on public.attendance (employee_id, attendance_date) where deleted_at is null;
create index attendance_company_date_idx on public.attendance (company_id, attendance_date);
create index attendance_employee_date_idx on public.attendance (employee_id, attendance_date);
create index attendance_status_idx on public.attendance (status);
create trigger set_attendance_updated_at before update on public.attendance
  for each row execute function public.set_updated_at();

create table public.attendance_corrections (
  id uuid primary key default gen_random_uuid(),
  attendance_id uuid not null references public.attendance (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  requested_check_in timestamptz,
  requested_check_out timestamptz,
  requested_status text,
  reason text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index attendance_corrections_attendance_idx on public.attendance_corrections (attendance_id);
create index attendance_corrections_status_idx on public.attendance_corrections (status);
create trigger set_attendance_corrections_updated_at before update on public.attendance_corrections
  for each row execute function public.set_updated_at();

-- RLS (attendance:view / attendance:manage)
alter table public.shifts enable row level security;
alter table public.attendance enable row level security;
alter table public.attendance_corrections enable row level security;

do $$
declare t text;
begin
  foreach t in array array['shifts','attendance','attendance_corrections'] loop
    execute format('create policy %I on public.%I for select to authenticated using (public.has_permission(''attendance:view''))', t||'_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.has_permission(''attendance:manage''))', t||'_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.has_permission(''attendance:manage'')) with check (public.has_permission(''attendance:manage''))', t||'_update', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;
end $$;

-- Seed a default shift for the existing company
insert into public.shifts (company_id, name, code, start_time, end_time, break_minutes, grace_minutes)
select c.id, 'General', 'GEN', '09:00', '18:00', 60, 15
from (select id from public.companies where deleted_at is null order by created_at asc limit 1) c
where not exists (select 1 from public.shifts);
