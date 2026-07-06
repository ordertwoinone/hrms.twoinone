import type { Database } from "@/types/database.types";

type Tbl = Database["public"]["Tables"];

export type EmployeeLoan = Tbl["employee_loans"]["Row"];
export type PayrollRun = Tbl["payroll_runs"]["Row"];
export type Payslip = Tbl["payslips"]["Row"];
export type SalaryAdvance = Tbl["salary_advances"]["Row"];
export type Bonus = Tbl["bonuses"]["Row"];
export type BankAccount = Tbl["bank_accounts"]["Row"];
export type LoanPayment = Tbl["loan_payments"]["Row"];

export type RunStatus = "draft" | "pending" | "approved" | "paid" | "cancelled";
export type LoanStatus = "active" | "closed" | "cancelled";
export type AdvanceStatus = "pending" | "approved" | "active" | "closed" | "rejected" | "cancelled";
export type BonusStatus = "pending" | "approved" | "paid" | "cancelled";
export type BonusType = "performance" | "annual" | "festival" | "referral" | "retention" | "spot" | "other";

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
  food: number;
  telephone: number;
  other: number;
  commissionFixed: number;
  deductions: number;
  overtimeRateMultiplier: number;
  ssEmployeePct: number;
  ssEmployerPct: number;
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

export interface AdvanceListItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string | null;
  amount: number;
  advanceDate: string;
  repaymentMonths: number;
  monthlyDeduction: number;
  outstanding: number;
  reason: string | null;
  status: AdvanceStatus;
  approvedAt: string | null;
  notes: string | null;
}

export interface BonusListItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string | null;
  bonusType: BonusType;
  amount: number;
  effectiveMonth: number | null;
  effectiveYear: number | null;
  description: string | null;
  status: BonusStatus;
  approvedAt: string | null;
  payrollRunId: string | null;
  notes: string | null;
}

export interface BankAccountItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string | null;
  bankName: string;
  accountNumber: string;
  iban: string;
  accountHolderName: string;
  currency: string;
  isPrimary: boolean;
  status: string;
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
  lockedAt: string | null;
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
  food: number;
  telephone: number;
  other: number;
  overtime: number;
  bonus: number;
  commission: number;
  gross: number;
  deductions: number;
  loanDeduction: number;
  advanceDeduction: number;
  penalty: number;
  tax: number;
  net: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  otHours: number;
  otAmount: number;
  ssEmployee: number;
  ssEmployer: number;
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
  activeAdvancesOutstanding: number;
  pendingBonuses: number;
  currency: string;
  recentRuns: PayrollRunListItem[];
  byMonthNet: { label: string; value: number }[];
}

export interface PayrollFormOptions {
  employees: IdNameOption[];
}
