import { Badge } from "@/components/ui/badge";
import { EXPIRY_LEVELS, LABOUR_CARD_STATUSES } from "../constants";
import type { ExpiryLevel, LabourCardStatus } from "../types";

export function LabourCardStatusBadge({
  status,
}: {
  status: LabourCardStatus;
}) {
  const match = LABOUR_CARD_STATUSES.find((s) => s.value === status);
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
