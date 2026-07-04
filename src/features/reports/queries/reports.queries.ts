import "server-only";

import { LOCALE } from "@/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { MONTHS_SHORT } from "../constants";
import type { AnalyticsOverview, ReportDataset, ReportType } from "../types";

type Emp = {
  first_name: string;
  last_name: string;
  employee_code: string | null;
} | null;
const empName = (e: Emp) => (e ? `${e.first_name} ${e.last_name}` : "—");
const num = (v: unknown) => Number(v ?? 0);
const todayISO = () => new Date().toISOString().slice(0, 10);
const plusDaysISO = (d: number) =>
  new Date(Date.now() + d * 86_400_000).toISOString().slice(0, 10);

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const admin = createAdminClient();
  const year = new Date().getFullYear();
  const today = todayISO();
  const in90 = plusDaysISO(90);

  const expiringCount = async (
    table:
      | "visas"
      | "passports"
      | "medical_insurance_policies"
      | "emirates_ids"
      | "labour_cards",
  ) => {
    const { count } = await admin
      .from(table)
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .in("status", ["active", "in_process"])
      .gte("expiry_date", today)
      .lte("expiry_date", in90);
    return count ?? 0;
  };

  const [
    employeesRes,
    departmentsRes,
    leaveRes,
    contractsRes,
    runsRes,
    visaExp,
    passportExp,
    insuranceExp,
    eidExp,
    labourExp,
  ] = await Promise.all([
    admin
      .from("employees")
      .select("id, department:departments(name)")
      .is("deleted_at", null)
      .eq("status", "active"),
    admin
      .from("departments")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "active"),
    admin
      .from("leave_requests")
      .select("status, total_days, start_date, end_date")
      .is("deleted_at", null)
      .gte("start_date", `${year}-01-01`)
      .lte("start_date", `${year}-12-31`),
    admin
      .from("contracts")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "active"),
    admin
      .from("payroll_runs")
      .select("period_year, period_month, total_net, status")
      .is("deleted_at", null)
      .in("status", ["approved", "paid"])
      .order("period_year", { ascending: true })
      .order("period_month", { ascending: true }),
    expiringCount("visas"),
    expiringCount("passports"),
    expiringCount("medical_insurance_policies"),
    expiringCount("emirates_ids"),
    expiringCount("labour_cards"),
  ]);

  const employees = employeesRes.data ?? [];
  const deptCounts = new Map<string, number>();
  for (const e of employees) {
    const name = (e.department as { name: string } | null)?.name ?? "Unassigned";
    deptCounts.set(name, (deptCounts.get(name) ?? 0) + 1);
  }

  const leaveRows = leaveRes.data ?? [];
  let onLeaveToday = 0;
  let pendingLeave = 0;
  const leaveMonth = new Array(12).fill(0) as number[];
  for (const l of leaveRows) {
    if (l.status === "pending" || l.status === "manager_approved") {
      pendingLeave += 1;
    }
    if (l.status === "approved") {
      if (today >= l.start_date && today <= l.end_date) onLeaveToday += 1;
      const m = Number(l.start_date.slice(5, 7)) - 1;
      if (m >= 0 && m < 12) leaveMonth[m] = (leaveMonth[m] ?? 0) + num(l.total_days);
    }
  }

  const runs = runsRes.data ?? [];
  const payrollByMonth = runs.slice(-12).map((r) => ({
    label: `${MONTHS_SHORT[r.period_month - 1]} ${String(r.period_year).slice(2)}`,
    value: num(r.total_net),
  }));
  const lastPayrollNet = runs.length ? num(runs[runs.length - 1]!.total_net) : 0;

  return {
    headcount: employees.length,
    departments: departmentsRes.count ?? 0,
    onLeaveToday,
    pendingLeave,
    activeContracts: contractsRes.count ?? 0,
    docsExpiring90:
      visaExp + passportExp + insuranceExp + eidExp + labourExp,
    lastPayrollNet,
    currency: LOCALE.currency,
    headcountByDepartment: [...deptCounts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8),
    leaveByMonth: leaveMonth.map((value, i) => ({
      label: MONTHS_SHORT[i]!,
      value,
    })),
    payrollByMonth,
    complianceExpiry: [
      { name: "Visas", value: visaExp },
      { name: "Passports", value: passportExp },
      { name: "Emirates IDs", value: eidExp },
      { name: "Labour Cards", value: labourExp },
      { name: "Insurance", value: insuranceExp },
    ],
  };
}

export async function getReport(type: ReportType): Promise<ReportDataset> {
  const admin = createAdminClient();

  switch (type) {
    case "employees": {
      const { data } = await admin
        .from("employees")
        .select(
          "employee_code, first_name, last_name, work_email, status, date_of_joining, department:departments(name), designation:designations(name), branch:branches(name)",
        )
        .is("deleted_at", null)
        .order("first_name");
      return {
        type,
        title: "Employees",
        columns: [
          { key: "code", label: "Code" },
          { key: "name", label: "Name" },
          { key: "email", label: "Work email" },
          { key: "department", label: "Department" },
          { key: "designation", label: "Designation" },
          { key: "branch", label: "Branch" },
          { key: "joined", label: "Joined" },
          { key: "status", label: "Status" },
        ],
        rows: (data ?? []).map((e) => ({
          code: e.employee_code,
          name: `${e.first_name} ${e.last_name}`,
          email: e.work_email,
          department: (e.department as { name: string } | null)?.name ?? "—",
          designation: (e.designation as { name: string } | null)?.name ?? "—",
          branch: (e.branch as { name: string } | null)?.name ?? "—",
          joined: e.date_of_joining,
          status: e.status,
        })),
      };
    }
    case "attendance": {
      const { data } = await admin
        .from("attendance")
        .select(
          "attendance_date, status, work_minutes, late_minutes, overtime_minutes, employee:employees(first_name, last_name, employee_code)",
        )
        .is("deleted_at", null)
        .order("attendance_date", { ascending: false })
        .limit(2000);
      return {
        type,
        title: "Attendance",
        columns: [
          { key: "date", label: "Date" },
          { key: "employee", label: "Employee" },
          { key: "status", label: "Status" },
          { key: "work", label: "Work (min)", numeric: true },
          { key: "late", label: "Late (min)", numeric: true },
          { key: "ot", label: "Overtime (min)", numeric: true },
        ],
        rows: (data ?? []).map((a) => ({
          date: a.attendance_date,
          employee: empName(a.employee as Emp),
          status: a.status,
          work: num(a.work_minutes),
          late: num(a.late_minutes),
          ot: num(a.overtime_minutes),
        })),
      };
    }
    case "leave": {
      const { data } = await admin
        .from("leave_requests")
        .select(
          "start_date, end_date, total_days, status, employee:employees!leave_requests_employee_id_fkey(first_name, last_name), leave_type:leave_types(name)",
        )
        .is("deleted_at", null)
        .order("start_date", { ascending: false });
      return {
        type,
        title: "Leave",
        columns: [
          { key: "employee", label: "Employee" },
          { key: "leaveType", label: "Type" },
          { key: "start", label: "Start" },
          { key: "end", label: "End" },
          { key: "days", label: "Days", numeric: true },
          { key: "status", label: "Status" },
        ],
        rows: (data ?? []).map((l) => ({
          employee: empName(l.employee as Emp),
          leaveType: (l.leave_type as { name: string } | null)?.name ?? "—",
          start: l.start_date,
          end: l.end_date,
          days: num(l.total_days),
          status: l.status,
        })),
      };
    }
    case "payroll": {
      const { data } = await admin
        .from("payroll_runs")
        .select(
          "period_year, period_month, status, employee_count, total_gross, total_deductions, total_net, currency",
        )
        .is("deleted_at", null)
        .order("period_year", { ascending: false })
        .order("period_month", { ascending: false });
      return {
        type,
        title: "Payroll",
        columns: [
          { key: "period", label: "Period" },
          { key: "status", label: "Status" },
          { key: "employees", label: "Employees", numeric: true },
          { key: "gross", label: "Gross", numeric: true },
          { key: "deductions", label: "Deductions", numeric: true },
          { key: "net", label: "Net", numeric: true },
        ],
        rows: (data ?? []).map((r) => ({
          period: `${r.period_year}-${String(r.period_month).padStart(2, "0")}`,
          status: r.status,
          employees: r.employee_count,
          gross: num(r.total_gross),
          deductions: num(r.total_deductions),
          net: num(r.total_net),
        })),
      };
    }
    case "visas": {
      const { data } = await admin
        .from("visas")
        .select(
          "visa_number, visa_type, sponsor, issue_date, expiry_date, status, employee:employees(first_name, last_name)",
        )
        .is("deleted_at", null)
        .order("expiry_date");
      return {
        type,
        title: "Visas",
        columns: [
          { key: "employee", label: "Employee" },
          { key: "number", label: "Visa number" },
          { key: "visaType", label: "Type" },
          { key: "sponsor", label: "Sponsor" },
          { key: "expiry", label: "Expiry" },
          { key: "status", label: "Status" },
        ],
        rows: (data ?? []).map((v) => ({
          employee: empName(v.employee as Emp),
          number: v.visa_number,
          visaType: v.visa_type,
          sponsor: v.sponsor,
          expiry: v.expiry_date,
          status: v.status,
        })),
      };
    }
    case "passports": {
      const { data } = await admin
        .from("passports")
        .select(
          "passport_number, nationality, issue_date, expiry_date, status, employee:employees(first_name, last_name)",
        )
        .is("deleted_at", null)
        .order("expiry_date");
      return {
        type,
        title: "Passports",
        columns: [
          { key: "employee", label: "Employee" },
          { key: "number", label: "Passport" },
          { key: "nationality", label: "Nationality" },
          { key: "expiry", label: "Expiry" },
          { key: "status", label: "Status" },
        ],
        rows: (data ?? []).map((p) => ({
          employee: empName(p.employee as Emp),
          number: p.passport_number,
          nationality: p.nationality,
          expiry: p.expiry_date,
          status: p.status,
        })),
      };
    }
    case "insurance": {
      const { data } = await admin
        .from("medical_insurance_policies")
        .select(
          "provider, policy_number, coverage, dependents_covered, expiry_date, status, employee:employees(first_name, last_name)",
        )
        .is("deleted_at", null)
        .order("expiry_date");
      return {
        type,
        title: "Medical Insurance",
        columns: [
          { key: "employee", label: "Employee" },
          { key: "provider", label: "Provider" },
          { key: "policy", label: "Policy" },
          { key: "coverage", label: "Coverage" },
          { key: "dependents", label: "Dependents", numeric: true },
          { key: "expiry", label: "Expiry" },
          { key: "status", label: "Status" },
        ],
        rows: (data ?? []).map((m) => ({
          employee: empName(m.employee as Emp),
          provider: m.provider,
          policy: m.policy_number,
          coverage: m.coverage,
          dependents: num(m.dependents_covered),
          expiry: m.expiry_date,
          status: m.status,
        })),
      };
    }
    case "contracts": {
      const { data } = await admin
        .from("contracts")
        .select(
          "contract_type, start_date, end_date, status, employee:employees(first_name, last_name)",
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      return {
        type,
        title: "Contracts",
        columns: [
          { key: "employee", label: "Employee" },
          { key: "contractType", label: "Type" },
          { key: "start", label: "Start" },
          { key: "end", label: "End" },
          { key: "status", label: "Status" },
        ],
        rows: (data ?? []).map((c) => ({
          employee: empName(c.employee as Emp),
          contractType: c.contract_type,
          start: c.start_date,
          end: c.end_date ?? "Open-ended",
          status: c.status,
        })),
      };
    }
    case "assets": {
      const { data } = await admin
        .from("employee_assets")
        .select(
          "name, asset_tag, category, assigned_date, return_date, status, employee:employees(first_name, last_name)",
        )
        .is("deleted_at", null)
        .order("assigned_date", { ascending: false });
      return {
        type,
        title: "Assets",
        columns: [
          { key: "employee", label: "Employee" },
          { key: "name", label: "Asset" },
          { key: "tag", label: "Tag" },
          { key: "category", label: "Category" },
          { key: "assigned", label: "Assigned" },
          { key: "status", label: "Status" },
        ],
        rows: (data ?? []).map((a) => ({
          employee: empName(a.employee as Emp),
          name: a.name,
          tag: a.asset_tag,
          category: a.category,
          assigned: a.assigned_date,
          status: a.status,
        })),
      };
    }
    case "departments": {
      const { data } = await admin
        .from("departments")
        .select("name, code, status, branch:branches(name)")
        .is("deleted_at", null)
        .order("name");
      return {
        type,
        title: "Departments",
        columns: [
          { key: "name", label: "Department" },
          { key: "code", label: "Code" },
          { key: "branch", label: "Branch" },
          { key: "status", label: "Status" },
        ],
        rows: (data ?? []).map((d) => ({
          name: d.name,
          code: d.code,
          branch: (d.branch as { name: string } | null)?.name ?? "—",
          status: d.status,
        })),
      };
    }
    case "branches": {
      const { data } = await admin
        .from("branches")
        .select("name, code, city, country, status")
        .is("deleted_at", null)
        .order("name");
      return {
        type,
        title: "Branches",
        columns: [
          { key: "name", label: "Branch" },
          { key: "code", label: "Code" },
          { key: "city", label: "City" },
          { key: "country", label: "Country" },
          { key: "status", label: "Status" },
        ],
        rows: (data ?? []).map((b) => ({
          name: b.name,
          code: b.code,
          city: b.city,
          country: b.country,
          status: b.status,
        })),
      };
    }
  }
}
