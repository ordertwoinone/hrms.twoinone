import { Badge } from "@/components/ui/badge";
import type { EmploymentTypeStatus } from "../types";

export function EmploymentTypeStatusBadge({
  status,
}: {
  status: EmploymentTypeStatus;
}) {
  return status === "active" ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      Inactive
    </Badge>
  );
}

/** Marks a built-in (non-deletable) employment type. */
export function SystemBadge() {
  return <Badge variant="default">System</Badge>;
}
