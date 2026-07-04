import { Badge } from "@/components/ui/badge";
import { CONTRACT_STATUSES, EXPIRY_LEVELS } from "../constants";
import type { ContractStatus, ExpiryLevel } from "../types";

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const match = CONTRACT_STATUSES.find((s) => s.value === status);
  return (
    <Badge variant={match?.variant ?? "outline"}>
      {match?.label ?? status}
    </Badge>
  );
}

/** Renders an expiry-urgency badge, or nothing when the contract isn't flagged. */
export function ExpiryBadge({
  level,
  daysToExpiry,
}: {
  level: ExpiryLevel;
  daysToExpiry: number | null;
}) {
  if (level === "ok") return null;
  const meta = EXPIRY_LEVELS[level];
  const suffix =
    daysToExpiry === null
      ? null
      : level === "expired"
        ? `${Math.abs(daysToExpiry)}d ago`
        : `${daysToExpiry}d`;
  return (
    <Badge variant={meta.variant}>
      {meta.label}
      {suffix ? <span className="opacity-70">· {suffix}</span> : null}
    </Badge>
  );
}
