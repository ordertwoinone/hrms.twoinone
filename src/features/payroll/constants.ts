import type { BadgeProps } from "@/components/ui/badge";
import type { LoanStatus, RunStatus } from "./types";

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function periodLabel(year: number, month: number): string {
  return `${MONTHS[month - 1] ?? "—"} ${year}`;
}

export const RUN_STATUSES: {
  value: RunStatus;
  label: string;
  variant: NonNullable<BadgeProps["variant"]>;
}[] = [
  { value: "draft", label: "Draft", variant: "outline" },
  { value: "pending", label: "Pending approval", variant: "warning" },
  { value: "approved", label: "Approved", variant: "primary" },
  { value: "paid", label: "Paid", variant: "success" },
  { value: "cancelled", label: "Cancelled", variant: "destructive" },
];

export const LOAN_STATUSES: {
  value: LoanStatus;
  label: string;
  variant: NonNullable<BadgeProps["variant"]>;
}[] = [
  { value: "active", label: "Active", variant: "primary" },
  { value: "closed", label: "Closed", variant: "success" },
  { value: "cancelled", label: "Cancelled", variant: "outline" },
];

export const LOAN_TYPES = [
  "Salary Advance",
  "Personal Loan",
  "Emergency Loan",
  "Housing Loan",
  "Other",
] as const;

/** Editable payslip components (added on top of the salary structure). */
export interface PayslipComponents {
  basic: number;
  housing: number;
  transport: number;
  other: number;
  overtime: number;
  bonus: number;
  commission: number;
  deductions: number;
  loan_deduction: number;
  tax: number;
}

/** Pure gross/net calculator shared by server (run generation) and UI preview. */
export function computePayslip(c: PayslipComponents): {
  gross: number;
  net: number;
} {
  const gross =
    c.basic +
    c.housing +
    c.transport +
    c.other +
    c.overtime +
    c.bonus +
    c.commission;
  const net = gross - c.deductions - c.loan_deduction - c.tax;
  return { gross: round2(gross), net: round2(net) };
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
