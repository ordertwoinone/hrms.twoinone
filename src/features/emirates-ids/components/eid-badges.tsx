import { Badge } from "@/components/ui/badge";
import { EID_STATUSES, EXPIRY_LEVELS } from "../constants";
import type { EidStatus, ExpiryLevel } from "../types";

export function EidStatusBadge({ status }: { status: EidStatus }) {
  const match = EID_STATUSES.find((s) => s.value === status);
  return (
    <Badge variant={match?.variant ?? "outline"}>
      {match?.label ?? status}
    </Badge>
  );
}

export function ExpiryBadge({
  level,
  daysToExpiry,
}: {
  level: ExpiryLevel;
  daysToExpiry: number;
}) {
  const meta = EXPIRY_LEVELS[level];
  const suffix =
    level === "expired"
      ? `${Math.abs(daysToExpiry)}d ago`
      : level === "ok"
        ? null
        : `${daysToExpiry}d`;
  return (
    <Badge variant={meta.variant}>
      {meta.label}
      {suffix ? <span className="opacity-70">· {suffix}</span> : null}
    </Badge>
  );
}
