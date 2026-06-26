import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import type { AuthUser } from "@/types/auth";
import { ROUTES } from "@/constants/routes";
import { ROLES, type Role } from "@/config/roles";
import { createClient } from "@/lib/supabase/server";
import { getPermissionsForRole } from "@/lib/auth/rbac";

/**
 * Server-side session helpers. `getCurrentUser` is wrapped in React `cache` so
 * multiple Server Components in one render share a single Supabase round-trip.
 *
 * NOTE: the profile/role lookup below is a placeholder. Once the `profiles`
 * table exists, replace the inline defaults with a real query that joins the
 * user's role and (optionally) their employee record.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // TODO(profiles): replace with a real `profiles` join once the schema lands.
  const role: Role =
    (user.app_metadata?.role as Role | undefined) ?? ROLES.EMPLOYEE;

  return {
    id: user.id,
    email: user.email ?? "",
    fullName:
      (user.user_metadata?.full_name as string | undefined) ??
      user.email ??
      "User",
    avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    role,
    permissions: getPermissionsForRole(role),
    employeeId: null,
    departmentId: null,
  };
});

/**
 * Require an authenticated user in a Server Component / Action. Redirects to
 * login when there is no session. Returns the user so callers stay terse.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(ROUTES.login);
  }
  return user;
}
