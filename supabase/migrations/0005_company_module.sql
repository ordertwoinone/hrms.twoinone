-- Company Management module: companies + company_holidays, permissions, RLS,
-- the public logo storage bucket, and a seed company row.

-- Permissions
insert into public.permissions (key, resource, action, description) values
  ('company:view','company','view','View company profile'),
  ('company:manage','company','manage','Manage company profile')
on conflict (key) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r
join public.permissions p on p.key in ('company:view','company:manage')
where r.key = 'super_admin'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r
join public.permissions p on p.key = 'company:view'
where r.key in ('admin','hr_manager')
on conflict do nothing;

-- companies
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trade_license_number text,
  tax_registration_number text,
  logo_url text,
  email text,
  phone text,
  website text,
  address_line text,
  city text,
  country text not null default 'United Arab Emirates',
  timezone text not null default 'Asia/Dubai',
  currency text not null default 'AED',
  working_days smallint[] not null default '{1,2,3,4,5}',
  office_start_time time,
  office_end_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
comment on table public.companies is 'Company / tenant profile and work-calendar configuration.';

create trigger set_companies_updated_at before update on public.companies
  for each row execute function public.set_updated_at();

-- company_holidays
create table public.company_holidays (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  holiday_date date not null,
  is_recurring boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  unique (company_id, holiday_date)
);
comment on table public.company_holidays is 'Public holidays for a company.';
create index company_holidays_company_idx on public.company_holidays (company_id, holiday_date);

-- RLS
alter table public.companies enable row level security;
alter table public.company_holidays enable row level security;

create policy "companies_select_authenticated" on public.companies
  for select to authenticated using (true);
create policy "companies_write_super_admin" on public.companies
  for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

create policy "company_holidays_select_authenticated" on public.company_holidays
  for select to authenticated using (true);
create policy "company_holidays_write_super_admin" on public.company_holidays
  for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

grant select on public.companies, public.company_holidays to authenticated;

-- Public storage bucket for the company logo
insert into storage.buckets (id, name, public) values ('company', 'company', true)
on conflict (id) do nothing;

-- Seed a single company row
insert into public.companies (name, country, timezone, currency, working_days)
select 'My Company', 'United Arab Emirates', 'Asia/Dubai', 'AED', '{1,2,3,4,5}'
where not exists (select 1 from public.companies);
