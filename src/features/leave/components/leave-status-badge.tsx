import { Badge } from "@/components/ui/badge";
import { LEAVE_STATUSES } from "../constants";
import type { LeaveStatus } from "../types";

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  const match = LEAVE_STATUSES.find((s) => s.value === status);
  return (
    <Badge variant={match?.variant ?? "outline"}>
      {match?.label ?? status}
    </Badge>
  );
}
