import { Badge } from "@/components/ui/badge";
import type { DesignationStatus } from "../types";

export function DesignationStatusBadge({
  status,
}: {
  status: DesignationStatus;
}) {
  return status === "active" ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      Inactive
    </Badge>
  );
}
