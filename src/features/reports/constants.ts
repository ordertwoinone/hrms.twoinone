import type { ReportType } from "./types";

export const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "employees", label: "Employees" },
  { value: "attendance", label: "Attendance" },
  { value: "leave", label: "Leave" },
  { value: "payroll", label: "Payroll" },
  { value: "visas", label: "Visas" },
  { value: "passports", label: "Passports" },
  { value: "insurance", label: "Medical Insurance" },
  { value: "contracts", label: "Contracts" },
  { value: "assets", label: "Assets" },
  { value: "departments", label: "Departments" },
  { value: "branches", label: "Branches" },
];

export const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

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
