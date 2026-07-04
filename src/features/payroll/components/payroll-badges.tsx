import { Badge } from "@/components/ui/badge";
import { LOAN_STATUSES, RUN_STATUSES } from "../constants";
import type { LoanStatus, RunStatus } from "../types";

export function RunStatusBadge({ status }: { status: RunStatus }) {
  const m = RUN_STATUSES.find((s) => s.value === status);
  return <Badge variant={m?.variant ?? "outline"}>{m?.label ?? status}</Badge>;
}

export function LoanStatusBadge({ status }: { status: LoanStatus }) {
  const m = LOAN_STATUSES.find((s) => s.value === status);
  return <Badge variant={m?.variant ?? "outline"}>{m?.label ?? status}</Badge>;
}
