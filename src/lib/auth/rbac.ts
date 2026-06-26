import type { Permission } from "@/constants/permissions";
import { ROLE_PERMISSIONS, type Role } from "@/config/roles";

/**
 * Pure, isomorphic RBAC helpers (no I/O, no server-only deps) so the SAME
 * authorization logic runs on the client (to hide UI) and the server (to
 * enforce). Server enforcement is the real gate; client checks are UX only.
 */

/** Resolve the full permission set granted to a role. */
export function getPermissionsForRole(role: Role): Permission[] {
  return [...ROLE_PERMISSIONS[role]];
}

/** True if `permissions` contains the required permission. */
export function hasPermission(
  permissions: readonly Permission[],
  required: Permission,
): boolean {
  return permissions.includes(required);
}

/** True if `permissions` contains at least one of the required permissions. */
export function hasAnyPermission(
  permissions: readonly Permission[],
  required: readonly Permission[],
): boolean {
  return required.some((p) => permissions.includes(p));
}

/** True if `permissions` contains every one of the required permissions. */
export function hasAllPermissions(
  permissions: readonly Permission[],
  required: readonly Permission[],
): boolean {
  return required.every((p) => permissions.includes(p));
}
