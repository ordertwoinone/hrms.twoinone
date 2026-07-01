import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, ROLES, type Role } from "@/config/roles";
import type { UserStatus } from "../types";

/** Role pill — the Super Admin role is emphasized. */
export function RoleBadge({ role }: { role: Role }) {
  const variant =
    role === ROLES.SUPER_ADMIN
      ? "primary"
      : role === ROLES.ADMIN
        ? "default"
        : "outline";
  return <Badge variant={variant}>{ROLE_LABELS[role]}</Badge>;
}

/** Active/Inactive status pill. */
export function UserStatusBadge({ status }: { status: UserStatus }) {
  return status === "active" ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      Inactive
    </Badge>
  );
}
