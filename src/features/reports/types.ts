export type ReportType =
  | "employees"
  | "attendance"
  | "leave"
  | "payroll"
  | "visas"
  | "passports"
  | "insurance"
  | "contracts"
  | "assets"
  | "departments"
  | "branches";

export interface ReportColumn {
  key: string;
  label: string;
  numeric?: boolean;
}

export type ReportRow = Record<string, string | number | null>;

export interface ReportDataset {
  type: ReportType;
  title: string;
  columns: ReportColumn[];
  rows: ReportRow[];
}

export interface AnalyticsOverview {
  headcount: number;
  departments: number;
  onLeaveToday: number;
  pendingLeave: number;
  activeContracts: number;
  docsExpiring90: number;
  lastPayrollNet: number;
  currency: string;
  headcountByDepartment: { name: string; value: number }[];
  leaveByMonth: { label: string; value: number }[];
  payrollByMonth: { label: string; value: number }[];
  complianceExpiry: { name: string; value: number }[];
}
