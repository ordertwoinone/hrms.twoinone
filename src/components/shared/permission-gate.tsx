"use client";

import * as React from "react";

import type { Permission } from "@/constants/permissions";
import { usePermissions } from "@/hooks/use-permissions";

interface PermissionGateProps {
  /** Permission(s) required to render the children. */
  permission: Permission | Permission[];
  /** Require ALL permissions instead of ANY (default: any). */
  requireAll?: boolean;
  /** Optional fallback rendered when access is denied. */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Conditionally renders UI based on the current user's permissions. This hides
 * controls a user can't use — it is NOT a security boundary. Always pair with
 * server-side guards and RLS for real enforcement.
 */
export function PermissionGate({
  permission,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { can, canAny, canAll } = usePermissions();
  const required = Array.isArray(permission) ? permission : [permission];

  const allowed =
    required.length === 1
      ? can(required[0]!)
      : requireAll
        ? canAll(required)
        : canAny(required);

  return <>{allowed ? children : fallback}</>;
}
