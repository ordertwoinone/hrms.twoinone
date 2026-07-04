-- Employee Self-Service Portal: links login accounts to employee records and
-- adds announcements, HR-letter requests, and per-user notifications.

-- Link an auth user to their employee record (set by HR / on invite).
alter table public.employees
  add column if not exists user_id uuid references auth.users (id) on delete set null;
create unique index if not exists employees_user_id_key
  on public.employees (user_id) where user_id is not null and deleted_at is null;

-- Company announcements shown in the portal.
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  title text not null,
  body text not null,
  status text not null default 'published'
    check (status in ('draft','published','archived')),
  pinned boolean not null default false,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index announcements_status_idx on public.announcements (status, published_at desc);
create trigger set_announcements_updated_at before update on public.announcements
  for each row execute function public.set_updated_at();

-- HR letter requests raised by employees (salary certificate, NOC, etc.).
create table public.hr_letter_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  letter_type text not null,
  addressed_to text,
  purpose text,
  status text not null default 'pending'
    check (status in ('pending','processing','ready','rejected')),
  hr_notes text,
  attachment_url text,
  attachment_name text,
  resolved_by uuid references auth.users (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index hr_letter_requests_employee_idx on public.hr_letter_requests (employee_id);
create index hr_letter_requests_status_idx on public.hr_letter_requests (status);
create trigger set_hr_letter_requests_updated_at before update on public.hr_letter_requests
  for each row execute function public.set_updated_at();

-- Per-user notifications (notification center).
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text,
  type text not null default 'info',
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- Helper: is the given employee row owned by the current user?
create or replace function public.owns_employee(emp uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.employees e
    where e.id = emp and e.user_id = auth.uid() and e.deleted_at is null
  );
$$;

alter table public.announcements enable row level security;
alter table public.hr_letter_requests enable row level security;
alter table public.notifications enable row level security;

-- Announcements: everyone authenticated reads published; settings:manage writes.
create policy announcements_select on public.announcements
  for select to authenticated
  using (status = 'published' or public.has_permission('settings:manage'));
create policy announcements_insert on public.announcements
  for insert to authenticated with check (public.has_permission('settings:manage'));
create policy announcements_update on public.announcements
  for update to authenticated
  using (public.has_permission('settings:manage'))
  with check (public.has_permission('settings:manage'));
grant select, insert, update on public.announcements to authenticated;

-- HR letters: owner or HR (document:view) reads; owner or HR creates; HR updates.
create policy hr_letters_select on public.hr_letter_requests
  for select to authenticated
  using (public.has_permission('document:view') or public.owns_employee(employee_id));
create policy hr_letters_insert on public.hr_letter_requests
  for insert to authenticated
  with check (public.has_permission('document:manage') or public.owns_employee(employee_id));
create policy hr_letters_update on public.hr_letter_requests
  for update to authenticated
  using (public.has_permission('document:manage'))
  with check (public.has_permission('document:manage'));
grant select, insert, update on public.hr_letter_requests to authenticated;

-- Notifications: users see and update only their own.
create policy notifications_select on public.notifications
  for select to authenticated using (user_id = auth.uid());
create policy notifications_update on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_insert on public.notifications
  for insert to authenticated with check (user_id = auth.uid());
grant select, insert, update on public.notifications to authenticated;

-- Private bucket for issued HR letters.
insert into storage.buckets (id, name, public)
values ('hr-letters','hr-letters', false)
on conflict (id) do nothing;
