-- RBAC helper functions (SECURITY DEFINER), profile-creation trigger, and RLS.

create or replace function public.current_user_role_key()
returns text language sql stable security definer set search_path = public as $$
  select r.key
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid() and p.deleted_at is null and p.status = 'active';
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role_key() = 'super_admin', false);
$$;

create or replace function public.has_permission(perm text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.profiles p
    join public.role_permissions rp on rp.role_id = p.role_id
    join public.permissions pe on pe.id = rp.permission_id
    where p.id = auth.uid() and p.deleted_at is null and p.status = 'active'
      and pe.key = perm
      and not exists (
        select 1 from public.user_permissions up
        where up.user_id = p.id and up.permission_id = pe.id and up.granted = false
      )
    union all
    select 1
    from public.user_permissions up
    join public.permissions pe on pe.id = up.permission_id
    where up.user_id = auth.uid() and up.granted = true and pe.key = perm
  );
$$;

create or replace function public.current_user_permissions()
returns table (key text) language sql stable security definer set search_path = public as $$
  select pe.key
  from public.profiles p
  join public.role_permissions rp on rp.role_id = p.role_id
  join public.permissions pe on pe.id = rp.permission_id
  where p.id = auth.uid() and p.deleted_at is null and p.status = 'active'
    and not exists (
      select 1 from public.user_permissions up
      where up.user_id = p.id and up.permission_id = pe.id and up.granted = false
    )
  union
  select pe.key
  from public.user_permissions up
  join public.permissions pe on pe.id = up.permission_id
  where up.user_id = auth.uid() and up.granted = true;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role_id uuid;
  v_role_key text;
begin
  v_role_key := coalesce(nullif(new.raw_user_meta_data->>'role_key', ''), 'employee');
  select id into v_role_id from public.roles where key = v_role_key and deleted_at is null;
  if v_role_id is null then
    select id into v_role_id from public.roles where key = 'employee';
  end if;

  insert into public.profiles (id, email, full_name, role_id, status, created_by)
  values (
    new.id, new.email,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), new.email),
    v_role_id, 'active',
    nullif(new.raw_user_meta_data->>'created_by', '')::uuid
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profiles enable row level security;
alter table public.user_permissions enable row level security;
alter table public.audit_logs enable row level security;

create policy "roles_select_authenticated" on public.roles
  for select to authenticated using (true);
create policy "roles_write_super_admin" on public.roles
  for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

create policy "permissions_select_authenticated" on public.permissions
  for select to authenticated using (true);
create policy "permissions_write_super_admin" on public.permissions
  for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

create policy "role_permissions_select_authenticated" on public.role_permissions
  for select to authenticated using (true);
create policy "role_permissions_write_super_admin" on public.role_permissions
  for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

create policy "profiles_select_self_or_privileged" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.has_permission('user:view'));
create policy "profiles_insert_privileged" on public.profiles
  for insert to authenticated with check (public.has_permission('user:create'));
create policy "profiles_update_self_or_privileged" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.has_permission('user:update'))
  with check (id = auth.uid() or public.has_permission('user:update'));

create policy "user_permissions_select_self_or_privileged" on public.user_permissions
  for select to authenticated
  using (user_id = auth.uid() or public.has_permission('user:view'));
create policy "user_permissions_write_super_admin" on public.user_permissions
  for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

create policy "audit_logs_select_privileged" on public.audit_logs
  for select to authenticated using (public.has_permission('audit:view'));

-- Grants (RLS still applies)
grant usage on schema public to anon, authenticated;
grant select on public.roles, public.permissions, public.role_permissions, public.audit_logs to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.user_permissions to authenticated;
grant execute on function public.current_user_role_key() to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.has_permission(text) to authenticated;
grant execute on function public.current_user_permissions() to authenticated;
