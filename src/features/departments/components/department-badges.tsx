import { Badge } from "@/components/ui/badge";
import type { DepartmentStatus } from "../types";

export function DepartmentStatusBadge({
  status,
}: {
  status: DepartmentStatus;
}) {
  return status === "active" ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      Inactive
    </Badge>
  );
}
