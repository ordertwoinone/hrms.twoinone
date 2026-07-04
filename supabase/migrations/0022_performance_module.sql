-- Performance Management module.
-- Tables: performance_cycles, performance_goals, performance_reviews

create table public.performance_cycles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'draft' check (status in ('draft','active','closed')),
  self_review_deadline date,
  manager_review_deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index perf_cycles_company_idx on public.performance_cycles (company_id);
create trigger set_performance_cycles_updated_at before update on public.performance_cycles
  for each row execute function public.set_updated_at();

create table public.performance_goals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  cycle_id uuid not null references public.performance_cycles (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  title text not null,
  description text,
  weight numeric(5,2) default 100,
  target_value text,
  achieved_value text,
  status text not null default 'pending' check (status in ('pending','in_progress','achieved','not_achieved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);
create index perf_goals_employee_idx on public.performance_goals (employee_id, cycle_id);
create trigger set_performance_goals_updated_at before update on public.performance_goals
  for each row execute function public.set_updated_at();

create table public.performance_reviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  cycle_id uuid not null references public.performance_cycles (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  reviewer_id uuid references public.employees (id) on delete set null,
  type text not null default 'self' check (type in ('self','manager','peer','360')),
  status text not null default 'pending' check (status in ('pending','in_progress','submitted','acknowledged')),
  overall_rating numeric(3,1),
  strengths text,
  improvements text,
  comments text,
  submitted_at timestamptz,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cycle_id, employee_id, type, reviewer_id)
);
create index perf_reviews_employee_idx on public.performance_reviews (employee_id, cycle_id);
create trigger set_performance_reviews_updated_at before update on public.performance_reviews
  for each row execute function public.set_updated_at();

-- Permissions
insert into public.permissions (key, resource, action, description)
values
  ('performance:view',   'performance', 'view',   'View performance cycles, goals, reviews'),
  ('performance:manage', 'performance', 'manage', 'Create cycles, set goals, submit reviews')
on conflict (key) do nothing;

-- RLS
alter table public.performance_cycles enable row level security;
alter table public.performance_goals enable row level security;
alter table public.performance_reviews enable row level security;

do $$
declare t text;
begin
  foreach t in array array['performance_cycles','performance_goals','performance_reviews'] loop
    execute format('create policy %I on public.%I for select to authenticated using (public.has_permission(''performance:view''))', t||'_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.has_permission(''performance:manage''))', t||'_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.has_permission(''performance:manage'')) with check (public.has_permission(''performance:manage''))', t||'_update', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;
end $$;
