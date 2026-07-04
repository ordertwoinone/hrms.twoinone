-- Training & Learning module.
-- Tables: training_courses, training_enrollments

create table public.training_courses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  title text not null,
  description text,
  category text,
  mode text not null default 'internal' check (mode in ('internal','external','online')),
  duration_hours numeric(6,2),
  provider text,
  max_seats int,
  scheduled_date date,
  deadline date,
  status text not null default 'draft' check (status in ('draft','published','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index training_courses_company_idx on public.training_courses (company_id);
create trigger set_training_courses_updated_at before update on public.training_courses
  for each row execute function public.set_updated_at();

create table public.training_enrollments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  course_id uuid not null references public.training_courses (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  status text not null default 'enrolled' check (status in ('enrolled','in_progress','completed','failed','withdrawn')),
  score numeric(5,2),
  completion_date date,
  certificate_url text,
  enrolled_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, employee_id)
);
create index training_enrollments_employee_idx on public.training_enrollments (employee_id);
create index training_enrollments_course_idx on public.training_enrollments (course_id);
create trigger set_training_enrollments_updated_at before update on public.training_enrollments
  for each row execute function public.set_updated_at();

-- Permissions
insert into public.permissions (key, resource, action, description)
values
  ('training:view',   'training', 'view',   'View training courses and enrollment status'),
  ('training:manage', 'training', 'manage', 'Create courses, manage enrollments, record completions')
on conflict (key) do nothing;

-- RLS
alter table public.training_courses enable row level security;
alter table public.training_enrollments enable row level security;

do $$
declare t text;
begin
  foreach t in array array['training_courses','training_enrollments'] loop
    execute format('create policy %I on public.%I for select to authenticated using (public.has_permission(''training:view''))', t||'_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.has_permission(''training:manage''))', t||'_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.has_permission(''training:manage'')) with check (public.has_permission(''training:manage''))', t||'_update', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;
end $$;
