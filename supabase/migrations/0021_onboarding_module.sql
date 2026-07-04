-- Onboarding & Offboarding module.
-- Tables: checklist_templates, onboarding_checklists, onboarding_tasks

create table public.checklist_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  type text not null default 'onboarding' check (type in ('onboarding','offboarding')),
  description text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index checklist_templates_company_idx on public.checklist_templates (company_id);
create trigger set_checklist_templates_updated_at before update on public.checklist_templates
  for each row execute function public.set_updated_at();

create table public.checklist_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.checklist_templates (id) on delete cascade,
  title text not null,
  description text,
  responsible_role text,
  due_day_offset int not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index checklist_template_items_template_idx on public.checklist_template_items (template_id);

create table public.onboarding_checklists (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  template_id uuid references public.checklist_templates (id) on delete set null,
  type text not null default 'onboarding' check (type in ('onboarding','offboarding')),
  title text not null,
  status text not null default 'in_progress' check (status in ('in_progress','completed','cancelled')),
  target_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index onboarding_checklists_employee_idx on public.onboarding_checklists (employee_id);
create index onboarding_checklists_company_idx on public.onboarding_checklists (company_id);
create trigger set_onboarding_checklists_updated_at before update on public.onboarding_checklists
  for each row execute function public.set_updated_at();

create table public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.onboarding_checklists (id) on delete cascade,
  title text not null,
  description text,
  responsible_role text,
  due_date date,
  completed_at timestamptz,
  completed_by uuid references auth.users (id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index onboarding_tasks_checklist_idx on public.onboarding_tasks (checklist_id);
create trigger set_onboarding_tasks_updated_at before update on public.onboarding_tasks
  for each row execute function public.set_updated_at();

-- Permissions
insert into public.permissions (key, resource, action, description)
values
  ('onboarding:view',   'onboarding', 'view',   'View onboarding/offboarding checklists'),
  ('onboarding:manage', 'onboarding', 'manage', 'Create, update, complete onboarding tasks')
on conflict (key) do nothing;

-- Grant to admin-level roles
do $$
declare role_rec record;
begin
  for role_rec in select id, key from public.roles where key in ('super_admin','admin','hr_manager','hr_executive','department_manager') and deleted_at is null loop
    insert into public.role_permissions (role_id, permission_id)
    select role_rec.id, p.id from public.permissions p
    where p.key in ('onboarding:view','onboarding:manage')
      and role_rec.key in ('super_admin','admin','hr_manager','hr_executive')
    on conflict do nothing;
    insert into public.role_permissions (role_id, permission_id)
    select role_rec.id, p.id from public.permissions p
    where p.key = 'onboarding:view'
      and role_rec.key = 'department_manager'
    on conflict do nothing;
  end loop;
end $$;

-- RLS
alter table public.checklist_templates enable row level security;
alter table public.checklist_template_items enable row level security;
alter table public.onboarding_checklists enable row level security;
alter table public.onboarding_tasks enable row level security;

do $$
declare t text;
begin
  foreach t in array array['checklist_templates','checklist_template_items','onboarding_checklists','onboarding_tasks'] loop
    execute format('create policy %I on public.%I for select to authenticated using (public.has_permission(''onboarding:view''))', t||'_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.has_permission(''onboarding:manage''))', t||'_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.has_permission(''onboarding:manage'')) with check (public.has_permission(''onboarding:manage''))', t||'_update', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;
end $$;

-- Seed default onboarding template
insert into public.checklist_templates (company_id, name, type, description)
select c.id, 'Standard Onboarding', 'onboarding', 'Default checklist for new employee onboarding'
from (select id from public.companies where deleted_at is null order by created_at limit 1) c
where not exists (select 1 from public.checklist_templates where type='onboarding');

insert into public.checklist_template_items (template_id, title, due_day_offset, sort_order)
select t.id, item.title, item.offset, item.ord
from (select id from public.checklist_templates where type='onboarding' limit 1) t,
(values
  ('Send welcome email', 0, 1),
  ('Set up workstation & accounts', 1, 2),
  ('Complete employee profile', 3, 3),
  ('Review company policies', 5, 4),
  ('Meet with department head', 7, 5),
  ('Assign buddy / mentor', 1, 6),
  ('Collect signed contracts', 3, 7),
  ('Upload ID documents', 5, 8),
  ('Enroll in benefits', 7, 9),
  ('Complete induction training', 14, 10)
) as item(title, offset, ord)
where not exists (select 1 from public.checklist_template_items);
