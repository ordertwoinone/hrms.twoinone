import { Badge } from "@/components/ui/badge";
import { EXPIRY_LEVELS, VISA_STATUSES } from "../constants";
import type { ExpiryLevel, VisaStatus } from "../types";

export function VisaStatusBadge({ status }: { status: VisaStatus }) {
  const match = VISA_STATUSES.find((s) => s.value === status);
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
