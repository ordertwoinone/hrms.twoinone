import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

import { LOCALE } from "@/constants";

/**
 * Date helpers built on date-fns. Centralized so date display is consistent
 * everywhere and the formats live in one place (`LOCALE`).
 */

type DateInput = string | number | Date;

function toDate(value: DateInput): Date | null {
  const date =
    typeof value === "string"
      ? parseISO(value)
      : value instanceof Date
        ? value
        : new Date(value);
  return isValid(date) ? date : null;
}

/** Format as "dd MMM yyyy". Returns "—" for invalid/empty input. */
export function formatDate(value: DateInput | null | undefined): string {
  if (value == null) return "—";
  const date = toDate(value);
  return date ? format(date, LOCALE.dateFormat) : "—";
}

/** Format as "dd MMM yyyy, HH:mm". */
export function formatDateTime(value: DateInput | null | undefined): string {
  if (value == null) return "—";
  const date = toDate(value);
  return date ? format(date, LOCALE.dateTimeFormat) : "—";
}

/** Relative time, e.g. "3 hours ago". */
export function formatRelative(value: DateInput | null | undefined): string {
  if (value == null) return "—";
  const date = toDate(value);
  return date ? formatDistanceToNow(date, { addSuffix: true }) : "—";
}

/** ISO date (yyyy-MM-dd) for inputs and DB date columns. */
export function toISODate(value: DateInput): string {
  const date = toDate(value);
  return date ? format(date, "yyyy-MM-dd") : "";
}
