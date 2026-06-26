import { LOCALE } from "@/constants";

/**
 * Pure formatting helpers. No React, no I/O — safe to use on client and server.
 * UAE defaults (AED currency, Asia/Dubai timezone) come from `LOCALE`.
 */

/** Format a number as AED currency (e.g. "AED 12,500.00"). */
export function formatCurrency(
  amount: number,
  currency: string = LOCALE.currency,
): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
  }).format(amount);
}

/** Format a number with grouped thousands. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-AE").format(value);
}

/** Build initials from a full name (e.g. "Ahmed Khan" → "AK"). */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (
    parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)
  ).toUpperCase();
}

/** Truncate a string to `max` chars with an ellipsis. */
export function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max).trimEnd()}…` : value;
}

/** Convert bytes to a human-readable size (e.g. "1.4 MB"). */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
