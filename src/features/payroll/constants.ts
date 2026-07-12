import type { BadgeProps } from "@/components/ui/badge";
import type { LoanStatus, AdvanceStatus, BonusStatus, BonusType, RunStatus } from "./types";

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
  "Car Loan",
  "Other",
] as const;

export const ADVANCE_STATUSES: {
  value: AdvanceStatus;
  label: string;
  variant: NonNullable<BadgeProps["variant"]>;
}[] = [
  { value: "pending", label: "Pending", variant: "warning" },
  { value: "approved", label: "Approved", variant: "primary" },
  { value: "active", label: "Active", variant: "success" },
  { value: "closed", label: "Closed", variant: "solid" },
  { value: "rejected", label: "Rejected", variant: "destructive" },
  { value: "cancelled", label: "Cancelled", variant: "outline" },
];

export const BONUS_TYPES: {
  value: BonusType;
  label: string;
}[] = [
  { value: "performance", label: "Performance" },
  { value: "annual", label: "Annual" },
  { value: "festival", label: "Festival / Eid" },
  { value: "referral", label: "Referral" },
  { value: "retention", label: "Retention" },
  { value: "spot", label: "Spot Award" },
  { value: "other", label: "Other" },
];

export const BONUS_STATUSES: {
  value: BonusStatus;
  label: string;
  variant: NonNullable<BadgeProps["variant"]>;
}[] = [
  { value: "pending", label: "Pending", variant: "warning" },
  { value: "approved", label: "Approved", variant: "primary" },
  { value: "paid", label: "Paid", variant: "success" },
  { value: "cancelled", label: "Cancelled", variant: "outline" },
];

/** All components that make up a payslip calculation. */
export interface PayslipComponents {
  basic: number;
  housing: number;
  transport: number;
  food: number;
  telephone: number;
  other: number;
  commissionFixed: number;
  overtime: number;
  bonus: number;
  commission: number;
  deductions: number;
  loan_deduction: number;
  advance_deduction: number;
  penalty: number;
  tax: number;
  ssEmployeePct: number;
  absentDays: number;
  workingDays: number;
  /** When provided, used directly instead of dailyBasicRate * absentDays. */
  absentDeductionOverride?: number;
}

/**
 * Pure gross/net calculator — single source of truth shared by server
 * (run generation) and client (UI previews). Handles absent-day deductions
 * and social security contributions per UAE payroll rules.
 */
export function computePayslip(c: PayslipComponents): {
  gross: number;
  net: number;
  ssEmployee: number;
  absentDeduction: number;
} {
  const dailyBasicRate =
    c.workingDays > 0
      ? round2((c.basic + c.housing + c.transport + c.food + c.telephone) / c.workingDays)
      : 0;
  const absentDeduction =
    c.absentDeductionOverride !== undefined
      ? round2(c.absentDeductionOverride)
      : round2(dailyBasicRate * c.absentDays);

  const gross = round2(
    c.basic +
    c.housing +
    c.transport +
    c.food +
    c.telephone +
    c.other +
    c.commissionFixed +
    c.overtime +
    c.bonus +
    c.commission -
    absentDeduction,
  );

  const ssEmployee = round2(Math.max(0, gross) * c.ssEmployeePct);

  const net = round2(
    Math.max(0, gross) -
    c.deductions -
    c.loan_deduction -
    c.advance_deduction -
    c.penalty -
    c.tax -
    ssEmployee,
  );

  return {
    gross: Math.max(0, gross),
    net: Math.max(0, net),
    ssEmployee,
    absentDeduction,
  };
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Count working days (Mon–Fri) in a calendar month. */
export function workingDaysInMonth(year: number, month: number): number {
  const daysInMonth = new Date(year, month, 0).getDate();
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}
