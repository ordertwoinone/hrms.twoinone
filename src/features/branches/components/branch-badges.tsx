import { Badge } from "@/components/ui/badge";
import type { BranchStatus } from "../types";

export function BranchStatusBadge({ status }: { status: BranchStatus }) {
  return status === "active" ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      Inactive
    </Badge>
  );
}
