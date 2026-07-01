import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import type { AuthUser } from "@/types/auth";
import { ROUTES } from "@/constants/routes";
import { ALL_PERMISSIONS, type Permission } from "@/constants/permissions";
import { ROLES, isRole, type Role } from "@/config/roles";
import { createClient } from "@/lib/supabase/server";
import { getPermissionsForRole } from "@/lib/auth/rbac";

/**
 * Server-side session helpers. `getCurrentUser` is wrapped in React `cache` so
 * multiple Server Components in one render share a single resolution.
 *
 * Authorization is database-backed: the user's profile (with its role) and the
 * effective permission set (role grants + per-user overrides) are read under
 * Row Level Security. A soft-deleted or inactive profile resolves to `null`,
 * effectively logging the user out of the app.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, avatar_url, status, role_id, role:roles(key)",
    )
    .eq("id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!profile || profile.status !== "active") return null;

  const roleKey = profile.role?.key;
  const role: Role = roleKey && isRole(roleKey) ? roleKey : ROLES.EMPLOYEE;

  // Effective permissions = role grants ± per-user overrides (DB-authoritative).
  const [{ data: rolePerms }, { data: overrides }] = await Promise.all([
    supabase
      .from("role_permissions")
      .select("permission:permissions(key)")
      .eq("role_id", profile.role_id),
    supabase
      .from("user_permissions")
      .select("granted, permission:permissions(key)")
      .eq("user_id", profile.id),
  ]);

  const effective = new Set<string>();
  for (const row of rolePerms ?? []) {
    if (row.permission?.key) effective.add(row.permission.key);
  }
  for (const row of overrides ?? []) {
    const key = row.permission?.key;
    if (!key) continue;
    if (row.granted) effective.add(key);
    else effective.delete(key);
  }

  const permissions = [...effective].filter((key): key is Permission =>
    (ALL_PERMISSIONS as readonly string[]).includes(key),
  );

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    role,
    permissions: permissions.length ? permissions : getPermissionsForRole(role),
    employeeId: null,
    departmentId: null,
  };
});

/**
 * Require an authenticated user in a Server Component / Action. Redirects to
 * login when there is no active session/profile. Returns the user so callers
 * stay terse.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(ROUTES.login);
  }
  return user;
}
