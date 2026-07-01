-- Hardening: lock the trigger helper's search_path and remove anon/public RPC
-- access to the RBAC helper functions (RLS evaluates them as `authenticated`).

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Supabase grants EXECUTE to anon by default, so revoke from both public and anon.
revoke execute on function public.current_user_role_key() from public, anon;
revoke execute on function public.is_super_admin() from public, anon;
revoke execute on function public.has_permission(text) from public, anon;
revoke execute on function public.current_user_permissions() from public, anon;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
