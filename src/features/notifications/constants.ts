import type { BadgeProps } from "@/components/ui/badge";
import type { NotificationCategory } from "./types";

export const NOTIFICATION_CATEGORIES: {
  value: NotificationCategory;
  label: string;
  description: string;
}[] = [
  { value: "visa_expiry", label: "Visa expiry", description: "Employee visas nearing expiry." },
  { value: "passport_expiry", label: "Passport expiry", description: "Passports nearing expiry." },
  { value: "insurance_expiry", label: "Insurance expiry", description: "Medical insurance policies nearing expiry." },
  { value: "contract_expiry", label: "Contract expiry", description: "Employment contracts ending soon." },
  { value: "document_expiry", label: "Document expiry", description: "Emirates IDs, labour cards, and documents." },
  { value: "birthday", label: "Birthdays", description: "Employee birthdays today." },
  { value: "work_anniversary", label: "Work anniversaries", description: "Employee work anniversaries." },
  { value: "leave", label: "Leave approvals", description: "Updates on your leave requests." },
  { value: "payroll", label: "Payroll", description: "Payroll completion and payslips." },
  { value: "system", label: "System", description: "General system messages." },
];

/** Severity → badge variant for the notification dot/label. */
export const SEVERITY_VARIANT: Record<
  string,
  NonNullable<BadgeProps["variant"]>
> = {
  info: "primary",
  success: "success",
  warning: "warning",
  destructive: "destructive",
};

export function categoryLabel(value: string): string {
  return (
    NOTIFICATION_CATEGORIES.find((c) => c.value === value)?.label ?? "System"
  );
}

const MS_PER_DAY = 86_400_000;

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
