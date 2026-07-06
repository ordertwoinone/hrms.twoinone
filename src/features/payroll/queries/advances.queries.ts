import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { AdvanceListItem, AdvanceStatus } from "../types";

const num = (v: unknown) => Number(v ?? 0);
type Emp = { first_name: string; last_name: string; employee_code: string | null } | null;
const empName = (e: Emp) => (e ? `${e.first_name} ${e.last_name}` : "—");

export interface AdvanceSummary {
  pending: number;
  approved: number;
  active: number;
  totalOutstanding: number;
}

export async function getAdvances(params: {
  status?: AdvanceStatus;
  employeeId?: string;
} = {}): Promise<AdvanceListItem[]> {
  const admin = createAdminClient();
  let q = admin
    .from("salary_advances")
    .select(
      "id, employee_id, amount, advance_date, repayment_months, monthly_deduction, outstanding, reason, status, approved_at, notes, employee:employees!salary_advances_employee_id_fkey(first_name, last_name, employee_code)",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (params.status) q = q.eq("status", params.status);
  if (params.employeeId) q = q.eq("employee_id", params.employeeId);

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).map((a) => ({
    id: a.id,
    employeeId: a.employee_id,
    employeeName: empName(a.employee as Emp),
    employeeCode: (a.employee as Emp)?.employee_code ?? null,
    amount: num(a.amount),
    advanceDate: a.advance_date,
    repaymentMonths: a.repayment_months,
    monthlyDeduction: num(a.monthly_deduction),
    outstanding: num(a.outstanding),
    reason: a.reason,
    status: a.status as AdvanceStatus,
    approvedAt: a.approved_at,
    notes: a.notes,
  }));
}

export function computeAdvanceSummary(advances: AdvanceListItem[]): AdvanceSummary {
  return {
    pending: advances.filter((a) => a.status === "pending").length,
    approved: advances.filter((a) => a.status === "approved").length,
    active: advances.filter((a) => a.status === "active").length,
    totalOutstanding: advances
      .filter((a) => a.status === "active")
      .reduce((sum, a) => sum + a.outstanding, 0),
  };
}

export async function getActiveAdvancesForPayroll(): Promise<
  { employeeId: string; monthlyDeduction: number; outstanding: number; id: string }[]
> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("salary_advances")
    .select("id, employee_id, monthly_deduction, outstanding")
    .is("deleted_at", null)
    .eq("status", "active");

  return (data ?? []).map((a) => ({
    id: a.id,
    employeeId: a.employee_id,
    monthlyDeduction: num(a.monthly_deduction),
    outstanding: num(a.outstanding),
  }));
}
