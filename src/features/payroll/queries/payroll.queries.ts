import "server-only";

import { LOCALE } from "@/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { MONTHS_SHORT, periodLabel } from "../constants";
import type {
  LoanListItem,
  LoanStatus,
  PayrollDashboardData,
  PayrollFormOptions,
  PayrollRunDetail,
  PayrollRunListItem,
  PayslipItem,
  RunStatus,
  SalaryStructureItem,
} from "../types";

const num = (v: unknown) => Number(v ?? 0);
type Emp = { first_name: string; last_name: string; employee_code: string | null } | null;
const empName = (e: Emp) => (e ? `${e.first_name} ${e.last_name}` : "—");

function toRunListItem(r: {
  id: string;
  period_year: number;
  period_month: number;
  status: string;
  currency: string;
  total_gross: number | string;
  total_deductions: number | string;
  total_net: number | string;
  employee_count: number;
  approved_at: string | null;
  paid_at: string | null;
  created_at: string;
  approvedByName?: string | null;
}): PayrollRunListItem {
  return {
    id: r.id,
    periodYear: r.period_year,
    periodMonth: r.period_month,
    periodLabel: periodLabel(r.period_year, r.period_month),
    status: r.status as RunStatus,
    currency: r.currency,
    totalGross: num(r.total_gross),
    totalDeductions: num(r.total_deductions),
    totalNet: num(r.total_net),
    employeeCount: r.employee_count,
    approvedByName: r.approvedByName ?? null,
    approvedAt: r.approved_at,
    paidAt: r.paid_at,
    createdAt: r.created_at,
  };
}

export async function getOrgName(): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("companies")
    .select("name")
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.name ?? "Company";
}

export async function getPayrollFormOptions(): Promise<PayrollFormOptions> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("employees")
    .select("id, first_name, last_name, employee_code")
    .is("deleted_at", null)
    .order("first_name");
  return {
    employees: (data ?? []).map((e) => ({
      id: e.id,
      name: `${e.first_name} ${e.last_name}`,
      code: e.employee_code,
    })),
  };
}

export async function getSalaryStructures(): Promise<SalaryStructureItem[]> {
  const admin = createAdminClient();
  const [{ data: employees }, { data: salaries }] = await Promise.all([
    admin
      .from("employees")
      .select("id, first_name, last_name, employee_code")
      .is("deleted_at", null)
      .eq("status", "active")
      .order("first_name"),
    admin
      .from("employee_salaries")
      .select(
        "employee_id, currency, basic, housing_allowance, transport_allowance, other_allowances, deductions, effective_date",
      )
      .is("deleted_at", null)
      .order("effective_date", { ascending: false }),
  ]);

  type SalaryRow = NonNullable<typeof salaries>[number];
  const latest = new Map<string, SalaryRow>();
  for (const s of salaries ?? []) {
    if (!latest.has(s.employee_id)) latest.set(s.employee_id, s);
  }

  return (employees ?? []).map((e) => {
    const s = latest.get(e.id);
    const basic = num(s?.basic);
    const housing = num(s?.housing_allowance);
    const transport = num(s?.transport_allowance);
    const other = num(s?.other_allowances);
    return {
      employeeId: e.id,
      employeeName: `${e.first_name} ${e.last_name}`,
      employeeCode: e.employee_code,
      currency: s?.currency ?? LOCALE.currency,
      basic,
      housing,
      transport,
      other,
      deductions: num(s?.deductions),
      gross: basic + housing + transport + other,
      effectiveDate: s?.effective_date ?? null,
    };
  });
}

export async function getLoans(): Promise<LoanListItem[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("employee_loans")
    .select(
      "id, employee_id, loan_type, principal, monthly_deduction, outstanding, start_date, status, notes, employee:employees(first_name, last_name, employee_code)",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return (data ?? []).map((l) => ({
    id: l.id,
    employeeId: l.employee_id,
    employeeName: empName(l.employee as Emp),
    employeeCode: (l.employee as Emp)?.employee_code ?? null,
    loanType: l.loan_type,
    principal: num(l.principal),
    monthlyDeduction: num(l.monthly_deduction),
    outstanding: num(l.outstanding),
    startDate: l.start_date,
    status: l.status as LoanStatus,
    notes: l.notes,
  }));
}

export async function getPayrollRuns(): Promise<PayrollRunListItem[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("payroll_runs")
    .select("*")
    .is("deleted_at", null)
    .order("period_year", { ascending: false })
    .order("period_month", { ascending: false });
  return (data ?? []).map((r) => toRunListItem(r));
}

export async function getPayrollRunById(
  id: string,
): Promise<PayrollRunDetail | null> {
  const admin = createAdminClient();
  const { data: run } = await admin
    .from("payroll_runs")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!run) return null;

  let approvedByName: string | null = null;
  if (run.approved_by) {
    const { data: prof } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", run.approved_by)
      .maybeSingle();
    approvedByName = prof?.full_name ?? null;
  }

  const { data: slips } = await admin
    .from("payslips")
    .select(
      "*, employee:employees(first_name, last_name, employee_code)",
    )
    .eq("run_id", id)
    .order("created_at", { ascending: true });

  const payslips: PayslipItem[] = (slips ?? []).map((p) => ({
    id: p.id,
    employeeId: p.employee_id,
    employeeName: empName(p.employee as Emp),
    employeeCode: (p.employee as Emp)?.employee_code ?? null,
    basic: num(p.basic),
    housing: num(p.housing_allowance),
    transport: num(p.transport_allowance),
    other: num(p.other_allowances),
    overtime: num(p.overtime),
    bonus: num(p.bonus),
    commission: num(p.commission),
    gross: num(p.gross),
    deductions: num(p.deductions),
    loanDeduction: num(p.loan_deduction),
    tax: num(p.tax),
    net: num(p.net),
    currency: p.currency,
    notes: p.notes,
  }));

  return {
    ...toRunListItem({ ...run, approvedByName }),
    notes: run.notes,
    payslips: payslips.sort((a, b) =>
      a.employeeName.localeCompare(b.employeeName),
    ),
  };
}

export async function getPayrollDashboard(): Promise<PayrollDashboardData> {
  const admin = createAdminClient();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [{ data: runs }, { data: loans }] = await Promise.all([
    admin
      .from("payroll_runs")
      .select("*")
      .is("deleted_at", null)
      .order("period_year", { ascending: false })
      .order("period_month", { ascending: false }),
    admin
      .from("employee_loans")
      .select("outstanding")
      .is("deleted_at", null)
      .eq("status", "active"),
  ]);

  const runList = (runs ?? []).map((r) => toRunListItem(r));
  const currentRun = runList.find(
    (r) => r.periodYear === year && r.periodMonth === month,
  );
  const pendingApprovals = runList.filter(
    (r) => r.status === "pending",
  ).length;
  const employeesPaid =
    runList.find((r) => r.status === "paid")?.employeeCount ?? 0;
  const activeLoansOutstanding = (loans ?? []).reduce(
    (sum, l) => sum + num(l.outstanding),
    0,
  );

  const byMonthNet = [...runList]
    .filter((r) => r.status === "approved" || r.status === "paid")
    .sort((a, b) =>
      a.periodYear === b.periodYear
        ? a.periodMonth - b.periodMonth
        : a.periodYear - b.periodYear,
    )
    .slice(-12)
    .map((r) => ({
      label: `${MONTHS_SHORT[r.periodMonth - 1]} ${String(r.periodYear).slice(2)}`,
      value: r.totalNet,
    }));

  return {
    currentMonthNet: currentRun?.totalNet ?? 0,
    currentMonthLabel: periodLabel(year, month),
    employeesPaid,
    pendingApprovals,
    activeLoansOutstanding,
    currency: runList[0]?.currency ?? LOCALE.currency,
    recentRuns: runList.slice(0, 6),
    byMonthNet,
  };
}
