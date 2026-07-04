import type { BadgeProps } from "@/components/ui/badge";
import type { ContractStatus, ExpiryLevel } from "./types";

/** Common contract types. Free-text is still allowed on the form. */
export const CONTRACT_TYPES = [
  "Full-time",
  "Part-time",
  "Fixed-term",
  "Temporary",
  "Probation",
  "Freelance",
  "Consultancy",
] as const;

export const CONTRACT_STATUSES: {
  value: ContractStatus;
  label: string;
  variant: NonNullable<BadgeProps["variant"]>;
}[] = [
  { value: "draft", label: "Draft", variant: "outline" },
  { value: "pending", label: "Pending approval", variant: "warning" },
  { value: "active", label: "Active", variant: "success" },
  { value: "expired", label: "Expired", variant: "destructive" },
  { value: "terminated", label: "Terminated", variant: "destructive" },
  { value: "renewed", label: "Renewed", variant: "default" },
];

/** Metadata for the derived expiry urgency levels. */
export const EXPIRY_LEVELS: Record<
  ExpiryLevel,
  { label: string; variant: NonNullable<BadgeProps["variant"]> }
> = {
  expired: { label: "Expired", variant: "destructive" },
  critical: { label: "≤ 30 days", variant: "destructive" },
  warning: { label: "≤ 60 days", variant: "warning" },
  notice: { label: "≤ 90 days", variant: "warning" },
  ok: { label: "—", variant: "outline" },
};

/** Reminder windows (days) surfaced on the dashboard and in notifications. */
export const ALERT_WINDOWS = [30, 60, 90] as const;

const MS_PER_DAY = 86_400_000;

/** Whole days from today (UTC) until `dateISO`. Negative when in the past. */
export function daysUntil(dateISO: string): number {
  const target = new Date(`${dateISO}T00:00:00Z`).getTime();
  const now = new Date();
  const todayUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return Math.round((target - todayUTC) / MS_PER_DAY);
}

/**
 * Classify a contract's expiry urgency from its end date. Open-ended contracts
 * (no end date) and inactive states are never flagged. Pure.
 */
export function contractExpiryLevel(
  endDate: string | null,
  status: ContractStatus,
): ExpiryLevel {
  if (!endDate) return "ok";
  if (status === "draft" || status === "terminated" || status === "renewed") {
    return "ok";
  }
  const days = daysUntil(endDate);
  if (days < 0) return "expired";
  if (days <= 30) return "critical";
  if (days <= 60) return "warning";
  if (days <= 90) return "notice";
  return "ok";
}

/** Human-readable label for a timeline event action. */
export function contractEventLabel(action: string): string {
  switch (action) {
    case "created":
      return "Created";
    case "updated":
      return "Updated";
    case "submitted":
      return "Submitted for approval";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "terminated":
      return "Terminated";
    case "renewed":
      return "Renewed";
    default:
      return action.replace(/_/g, " ");
  }
}
