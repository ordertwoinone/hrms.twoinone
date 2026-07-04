import type { LeaveStatus } from "./types";

export const LEAVE_STATUSES: {
  value: LeaveStatus;
  label: string;
  variant: "warning" | "primary" | "success" | "destructive" | "outline";
}[] = [
  { value: "pending", label: "Pending", variant: "warning" },
  { value: "manager_approved", label: "Manager approved", variant: "primary" },
  { value: "approved", label: "Approved", variant: "success" },
  { value: "rejected", label: "Rejected", variant: "destructive" },
  { value: "cancelled", label: "Cancelled", variant: "outline" },
];

export const HALF_DAY_PERIODS: { value: string; label: string }[] = [
  { value: "first", label: "First half" },
  { value: "second", label: "Second half" },
];

/** Badge variant name → allowed variant (leave_types.color stores these). */
export const LEAVE_COLOR_VARIANTS = [
  "primary",
  "success",
  "warning",
  "destructive",
  "outline",
  "default",
] as const;

/** Human-readable label for a timeline event action. */
export function leaveEventLabel(action: string): string {
  switch (action) {
    case "applied":
      return "Applied";
    case "manager_approved":
      return "Approved by manager";
    case "hr_approved":
      return "Approved by HR";
    case "rejected":
      return "Rejected";
    case "cancelled":
      return "Cancelled";
    default:
      return action.replace(/_/g, " ");
  }
}

/**
 * Count leave days between two ISO dates (inclusive), excluding weekends and
 * company holidays. Half-day requests count as 0.5. Pure — usable on the server.
 */
export function computeLeaveDays(
  startISO: string,
  endISO: string,
  workingDays: number[],
  holidays: Set<string>,
  isHalfDay: boolean,
): number {
  if (isHalfDay) return 0.5;

  const start = new Date(`${startISO}T00:00:00Z`);
  const end = new Date(`${endISO}T00:00:00Z`);
  if (end < start) return 0;

  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    const iso = cursor.toISOString().slice(0, 10);
    const weekday = cursor.getUTCDay();
    if (workingDays.includes(weekday) && !holidays.has(iso)) count += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}
