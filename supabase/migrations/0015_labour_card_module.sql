-- Labour Card Management module: labour_cards table, RLS, permissions, bucket.
-- One record per issued MOHRE labour card (renewals create a new record; the
-- prior one is marked 'renewed'). Expiry urgency (30/60/90-day reminders) is
-- derived from expiry_date in the application layer.

create table public.labour_cards (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  card_number text not null,
  issue_date date not null,
  expiry_date date not null,
  renewal_date date,
  status text not null default 'active'
    check (status in ('active','in_process','renewed','cancelled','expired')),
  attachment_url text,
  attachment_name text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index labour_cards_company_number_active_key
  on public.labour_cards (company_id, card_number) where deleted_at is null;
create index labour_cards_company_idx on public.labour_cards (company_id);
create index labour_cards_employee_idx on public.labour_cards (employee_id);
create index labour_cards_expiry_idx on public.labour_cards (expiry_date) where deleted_at is null;
create index labour_cards_status_idx on public.labour_cards (status);
create trigger set_labour_cards_updated_at before update on public.labour_cards
  for each row execute function public.set_updated_at();

-- RLS (labour_card:view / labour_card:manage)
alter table public.labour_cards enable row level security;
create policy labour_cards_select on public.labour_cards
  for select to authenticated using (public.has_permission('labour_card:view'));
create policy labour_cards_insert on public.labour_cards
  for insert to authenticated with check (public.has_permission('labour_card:manage'));
create policy labour_cards_update on public.labour_cards
  for update to authenticated
  using (public.has_permission('labour_card:manage'))
  with check (public.has_permission('labour_card:manage'));
grant select, insert, update on public.labour_cards to authenticated;

-- Permission catalog
insert into public.permissions (key, resource, action, description) values
  ('labour_card:view','labour_card','view','View labour cards'),
  ('labour_card:manage','labour_card','manage','Manage labour cards')
on conflict (key) do nothing;

-- super_admin gets every labour card permission
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.key = 'super_admin' and p.resource = 'labour_card'
on conflict do nothing;

with mapping (role_key, permission_key) as (
  values
    ('admin','labour_card:view'),('admin','labour_card:manage'),
    ('hr_manager','labour_card:view'),('hr_manager','labour_card:manage'),
    ('hr_executive','labour_card:view')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from mapping m
join public.roles r on r.key = m.role_key
join public.permissions p on p.key = m.permission_key
on conflict do nothing;

-- Private storage bucket for labour card documents (signed URLs / service role)
insert into storage.buckets (id, name, public)
values ('labour-card-documents','labour-card-documents', false)
on conflict (id) do nothing;
