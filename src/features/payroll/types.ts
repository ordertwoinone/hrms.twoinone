import type { Database } from "@/types/database.types";

type Tbl = Database["public"]["Tables"];

export type EmployeeLoan = Tbl["employee_loans"]["Row"];
export type PayrollRun = Tbl["payroll_runs"]["Row"];
export type Payslip = Tbl["payslips"]["Row"];

export type RunStatus = "draft" | "pending" | "approved" | "paid" | "cancelled";
export type LoanStatus = "active" | "closed" | "cancelled";

export interface IdNameOption {
  id: string;
  name: string;
  code?: string | null;
}

export interface SalaryStructureItem {
  employeeId: string;
  employeeName: string;
  employeeCode: string | null;
  currency: string;
  basic: number;
  housing: number;
  transport: number;
  other: number;
  deductions: number;
  gross: number;
  effectiveDate: string | null;
}

export interface LoanListItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string | null;
  loanType: string;
  principal: number;
  monthlyDeduction: number;
  outstanding: number;
  startDate: string;
  status: LoanStatus;
  notes: string | null;
}

export interface PayrollRunListItem {
  id: string;
  periodYear: number;
  periodMonth: number;
  periodLabel: string;
  status: RunStatus;
  currency: string;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  employeeCount: number;
  approvedByName: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface PayslipItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string | null;
  basic: number;
  housing: number;
  transport: number;
  other: number;
  overtime: number;
  bonus: number;
  commission: number;
  gross: number;
  deductions: number;
  loanDeduction: number;
  tax: number;
  net: number;
  currency: string;
  notes: string | null;
}

export interface PayrollRunDetail extends PayrollRunListItem {
  notes: string | null;
  payslips: PayslipItem[];
}

export interface PayrollDashboardData {
  currentMonthNet: number;
  currentMonthLabel: string;
  employeesPaid: number;
  pendingApprovals: number;
  activeLoansOutstanding: number;
  currency: string;
  recentRuns: PayrollRunListItem[];
  byMonthNet: { label: string; value: number }[];
}

export interface PayrollFormOptions {
  employees: IdNameOption[];
}
