import type { BadgeProps } from "@/components/ui/badge";
import type { EidStatus, ExpiryLevel } from "./types";

export const EID_STATUSES: {
  value: EidStatus;
  label: string;
  variant: NonNullable<BadgeProps["variant"]>;
}[] = [
  { value: "active", label: "Active", variant: "success" },
  { value: "in_process", label: "In process", variant: "primary" },
  { value: "renewed", label: "Renewed", variant: "default" },
  { value: "cancelled", label: "Cancelled", variant: "outline" },
  { value: "expired", label: "Expired", variant: "destructive" },
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
  ok: { label: "Valid", variant: "success" },
};

/** Alert windows (days) surfaced on the dashboard and in notifications. */
export const ALERT_WINDOWS = [30, 60, 90] as const;

/** Emirates ID is 15 digits beginning with 784 (784-YYYY-XXXXXXX-X). */
export const EID_DIGITS = /^784\d{12}$/;

/** True when `value` normalizes to a valid 15-digit Emirates ID. */
export function isValidEid(value: string): boolean {
  return EID_DIGITS.test(value.replace(/\D/g, ""));
}

/** Normalize any spacing/dashes to the canonical 784-YYYY-XXXXXXX-X form. */
export function formatEid(value: string): string {
  const d = value.replace(/\D/g, "");
  if (d.length !== 15) return value.trim();
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 14)}-${d.slice(14)}`;
}

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
 * Classify an Emirates ID's expiry urgency. Cancelled/renewed records are never
 * flagged. Pure — safe on both server and client.
 */
export function expiryLevel(expiryISO: string, status: EidStatus): ExpiryLevel {
  if (status === "cancelled" || status === "renewed") return "ok";
  const days = daysUntil(expiryISO);
  if (days < 0) return "expired";
  if (days <= 30) return "critical";
  if (days <= 60) return "warning";
  if (days <= 90) return "notice";
  return "ok";
}
