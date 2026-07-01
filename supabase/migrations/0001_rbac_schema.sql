-- RBAC + auth foundation schema.
-- Tables: roles, permissions, role_permissions, profiles, user_permissions,
-- audit_logs. UUID PKs, audit columns, soft delete, FKs, and indexes.

-- Shared updated_at trigger function (search_path locked in 0004).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  is_system boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
comment on table public.roles is 'RBAC roles (named permission bundles).';

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  resource text not null,
  action text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
comment on table public.permissions is 'RBAC permission catalog (resource:action).';

create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  unique (role_id, permission_id)
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null,
  avatar_url text,
  phone text,
  role_id uuid not null references public.roles (id),
  status text not null default 'active' check (status in ('active','inactive')),
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
comment on table public.profiles is 'Application user profiles (1:1 with auth.users).';
create unique index profiles_email_active_key on public.profiles (lower(email)) where deleted_at is null;
create index profiles_role_id_idx on public.profiles (role_id);
create index profiles_status_idx on public.profiles (status);

create table public.user_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  granted boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  unique (user_id, permission_id)
);
comment on table public.user_permissions is 'Per-user permission overrides (grant/revoke on top of role).';

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  metadata jsonb,
  created_at timestamptz not null default now()
);
comment on table public.audit_logs is 'Append-only audit trail of state changes.';
create index audit_logs_entity_idx on public.audit_logs (entity, entity_id);
create index audit_logs_actor_idx on public.audit_logs (actor_id);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

create trigger set_roles_updated_at before update on public.roles
  for each row execute function public.set_updated_at();
create trigger set_permissions_updated_at before update on public.permissions
  for each row execute function public.set_updated_at();
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
