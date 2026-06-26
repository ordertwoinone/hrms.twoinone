"use client";

import * as React from "react";

import type { Permission } from "@/constants/permissions";
import { useAuth } from "@/components/providers/auth-provider";
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "@/lib/auth/rbac";

/**
 * Client-side permission checks for conditionally rendering UI. This is UX
 * only — the server (guards + RLS) is the real authorization boundary.
 */
export function usePermissions() {
  const { user } = useAuth();
  const permissions = React.useMemo<Permission[]>(
    () => user?.permissions ?? [],
    [user],
  );

  return React.useMemo(
    () => ({
      permissions,
      can: (permission: Permission) => hasPermission(permissions, permission),
      canAny: (required: Permission[]) =>
        hasAnyPermission(permissions, required),
      canAll: (required: Permission[]) =>
        hasAllPermissions(permissions, required),
    }),
    [permissions],
  );
}
