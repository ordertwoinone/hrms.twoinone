-- Department Management module: departments table with a self-referencing
-- hierarchy (parent_id), branch + head references, RLS, indexes.
-- Reuses the existing department:view / department:manage permissions.

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  branch_id uuid references public.branches (id) on delete set null,
  parent_id uuid references public.departments (id) on delete set null,
  head_id uuid references public.profiles (id) on delete set null,
  name text not null,
  code text not null,
  description text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
comment on table public.departments is 'Company departments with optional hierarchy (parent_id).';

create unique index departments_company_code_active_key
  on public.departments (company_id, lower(code)) where deleted_at is null;
create index departments_company_idx on public.departments (company_id);
create index departments_branch_idx on public.departments (branch_id);
create index departments_parent_idx on public.departments (parent_id);
create index departments_status_idx on public.departments (status);

create trigger set_departments_updated_at before update on public.departments
  for each row execute function public.set_updated_at();

-- RLS
alter table public.departments enable row level security;

create policy "departments_select" on public.departments
  for select to authenticated using (public.has_permission('department:view'));
create policy "departments_insert" on public.departments
  for insert to authenticated with check (public.has_permission('department:manage'));
create policy "departments_update" on public.departments
  for update to authenticated
  using (public.has_permission('department:manage'))
  with check (public.has_permission('department:manage'));

grant select, insert, update on public.departments to authenticated;
