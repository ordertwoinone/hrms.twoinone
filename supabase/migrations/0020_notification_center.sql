-- Notification Center: extends notifications with categories + idempotent
-- dedupe keys, adds per-user channel preferences, and a management permission.

alter table public.notifications
  add column if not exists category text not null default 'system',
  add column if not exists dedupe_key text;
create unique index if not exists notifications_user_dedupe_key
  on public.notifications (user_id, dedupe_key) where dedupe_key is not null;
create index if not exists notifications_category_idx on public.notifications (category);

-- Per-user, per-category channel preferences (absent row = enabled).
create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  in_app boolean not null default true,
  email boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category)
);
create trigger set_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_updated_at();

alter table public.notification_preferences enable row level security;
create policy notif_prefs_select on public.notification_preferences
  for select to authenticated using (user_id = auth.uid());
create policy notif_prefs_insert on public.notification_preferences
  for insert to authenticated with check (user_id = auth.uid());
create policy notif_prefs_update on public.notification_preferences
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update on public.notification_preferences to authenticated;

-- Permission for running scans / broadcasting.
insert into public.permissions (key, resource, action, description) values
  ('notification:manage','notification','manage','Run and broadcast notifications')
on conflict (key) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.key = 'super_admin' and p.key = 'notification:manage'
on conflict do nothing;

with mapping (role_key, permission_key) as (
  values
    ('admin','notification:manage'),
    ('hr_manager','notification:manage')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from mapping m
join public.roles r on r.key = m.role_key
join public.permissions p on p.key = m.permission_key
on conflict do nothing;
