import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

import type { AuthUser } from "@/types/auth";
import { ROUTES } from "@/constants/routes";
import { ALL_PERMISSIONS, type Permission } from "@/constants/permissions";
import { ROLES, isRole, type Role } from "@/config/roles";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPermissionsForRole } from "@/lib/auth/rbac";

/**
 * Load profile + permissions from DB, cached for 60 s per user ID.
 * Uses the admin client (no cookies) so it is safe inside unstable_cache.
 */
const loadUserProfile = unstable_cache(
  async (userId: string) => {
    const admin = createAdminClient();

    // Two parallel queries: profile (with THIS role's permissions nested via FK join)
    // + per-user overrides. This avoids fetching every role's permissions and filtering in JS.
    const [profileResult, overridesResult] = await Promise.all([
      admin
        .from("profiles")
        .select(
          "id, email, full_name, avatar_url, status, role_id, role:roles(key, role_permissions(permission:permissions(key)))",
        )
        .eq("id", userId)
        .is("deleted_at", null)
        .maybeSingle(),
      admin
        .from("user_permissions")
        .select("granted, permission:permissions(key)")
        .eq("user_id", userId),
    ]);

    const profile = profileResult.data;
    if (!profile || profile.status !== "active") return null;

    const roleKey = (profile.role as { key?: string } | null)?.key;
    const role: Role = roleKey && isRole(roleKey) ? roleKey : ROLES.EMPLOYEE;

    type RoleWithPerms = {
      key: string;
      role_permissions: Array<{ permission: { key: string } | null }>;
    };
    const rolePerms =
      (profile.role as RoleWithPerms | null)?.role_permissions ?? [];
    const overrides = overridesResult.data ?? [];

    const effective = new Set<string>();
    for (const row of rolePerms) {
      if (row.permission?.key) effective.add(row.permission.key);
    }
    for (const row of overrides) {
      const key = (row.permission as { key?: string } | null)?.key;
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
    };
  },
  ["user-profile"],
  { revalidate: 60, tags: ["user-profile"] },
);

/**
 * Server-side session helpers. `getCurrentUser` is wrapped in React `cache` so
 * multiple Server Components in one render share a single resolution.
 * The profile + permissions lookup is additionally cached for 60 s across
 * navigations via `unstable_cache`, cutting repeated DB round trips.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await loadUserProfile(user.id);
  if (!profile) return null;

  return {
    ...profile,
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
