import { Badge } from "@/components/ui/badge";
import { EMPLOYEE_STATUSES } from "../constants";
import type { EmployeeStatus } from "../types";

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  const match = EMPLOYEE_STATUSES.find((s) => s.value === status);
  return (
    <Badge variant={match?.variant ?? "outline"}>
      {match?.label ?? status}
    </Badge>
  );
}
