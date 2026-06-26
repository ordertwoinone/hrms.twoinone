import "server-only";

import { redirect } from "next/navigation";

import type { AuthUser } from "@/types/auth";
import type { Permission } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { requireAuth } from "@/lib/auth/session";
import { hasAllPermissions, hasAnyPermission } from "@/lib/auth/rbac";

/**
 * Server-side authorization guards for Server Components, Actions, and Route
 * Handlers. These are the REAL enforcement boundary — never rely on hidden UI.
 *
 * `requirePermission` redirects to a safe page for page-level protection.
 * `assertPermission` throws for use inside Server Actions, where the caller
 * converts the failure into an `ActionResult` error.
 */
export async function requirePermission(
  permission: Permission | Permission[],
): Promise<AuthUser> {
  const user = await requireAuth();
  const required = Array.isArray(permission) ? permission : [permission];

  if (!hasAnyPermission(user.permissions, required)) {
    redirect(ROUTES.dashboard);
  }
  return user;
}

/** Like `requirePermission` but requires ALL listed permissions. */
export async function requireAllPermissions(
  permissions: Permission[],
): Promise<AuthUser> {
  const user = await requireAuth();
  if (!hasAllPermissions(user.permissions, permissions)) {
    redirect(ROUTES.dashboard);
  }
  return user;
}

/**
 * Throwing variant for Server Actions. Returns the authorized user or throws an
 * `AuthorizationError` that the action wrapper maps to a failed `ActionResult`.
 */
export async function assertPermission(
  permission: Permission | Permission[],
): Promise<AuthUser> {
  const user = await requireAuth();
  const required = Array.isArray(permission) ? permission : [permission];

  if (!hasAnyPermission(user.permissions, required)) {
    throw new AuthorizationError(
      "You do not have permission to perform this action.",
    );
  }
  return user;
}

/** Raised when an authenticated user lacks the required permission. */
export class AuthorizationError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "AuthorizationError";
  }
}
