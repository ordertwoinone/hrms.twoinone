-- Recruitment / ATS module.
-- Tables: job_postings, candidates, job_applications

create table public.job_postings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  title text not null,
  department_id uuid references public.departments (id) on delete set null,
  designation_id uuid references public.designations (id) on delete set null,
  branch_id uuid references public.branches (id) on delete set null,
  employment_type_id uuid references public.employment_types (id) on delete set null,
  description text,
  requirements text,
  salary_min numeric(12,2),
  salary_max numeric(12,2),
  currency text not null default 'AED',
  headcount int not null default 1,
  location text,
  status text not null default 'draft' check (status in ('draft','open','on_hold','closed','cancelled')),
  published_at timestamptz,
  closes_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index job_postings_company_idx on public.job_postings (company_id, status);
create trigger set_job_postings_updated_at before update on public.job_postings
  for each row execute function public.set_updated_at();

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  nationality text,
  current_title text,
  current_employer text,
  years_experience numeric(4,1),
  resume_url text,
  linkedin_url text,
  source text,
  tags text[],
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index candidates_company_idx on public.candidates (company_id);
create trigger set_candidates_updated_at before update on public.candidates
  for each row execute function public.set_updated_at();

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  job_posting_id uuid not null references public.job_postings (id) on delete cascade,
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  stage text not null default 'applied' check (stage in (
    'applied','screening','phone_screen','interview','technical','offer','hired','rejected','withdrawn'
  )),
  -- Stage timestamps for pipeline analytics
  applied_at timestamptz not null default now(),
  screened_at timestamptz,
  interviewed_at timestamptz,
  offered_at timestamptz,
  hired_at timestamptz,
  rejected_at timestamptz,
  -- Offer details (populated when stage = offer/hired)
  offered_salary numeric(12,2),
  offered_currency text default 'AED',
  expected_joining date,
  -- Tracking
  assigned_to uuid references auth.users (id) on delete set null,
  rating smallint check (rating between 1 and 5),
  rejection_reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_posting_id, candidate_id)
);
create index job_applications_posting_idx on public.job_applications (job_posting_id, stage);
create index job_applications_candidate_idx on public.job_applications (candidate_id);
create trigger set_job_applications_updated_at before update on public.job_applications
  for each row execute function public.set_updated_at();

-- Permissions
insert into public.permissions (key, resource, action, description)
values
  ('recruitment:view',   'recruitment', 'view',   'View job postings, candidates, and applications'),
  ('recruitment:manage', 'recruitment', 'manage', 'Create/update job postings, manage candidates and pipeline')
on conflict (key) do nothing;

-- RLS
alter table public.job_postings enable row level security;
alter table public.candidates enable row level security;
alter table public.job_applications enable row level security;

do $$
declare t text;
begin
  foreach t in array array['job_postings','candidates','job_applications'] loop
    execute format('create policy %I on public.%I for select to authenticated using (public.has_permission(''recruitment:view''))', t||'_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.has_permission(''recruitment:manage''))', t||'_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.has_permission(''recruitment:manage'')) with check (public.has_permission(''recruitment:manage''))', t||'_update', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;
end $$;
