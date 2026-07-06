import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { BonusListItem, BonusStatus, BonusType } from "../types";

const num = (v: unknown) => Number(v ?? 0);
type Emp = { first_name: string; last_name: string; employee_code: string | null } | null;
const empName = (e: Emp) => (e ? `${e.first_name} ${e.last_name}` : "—");

export interface BonusSummary {
  pending: number;
  approved: number;
  totalApprovedAmount: number;
}

export async function getBonuses(params: {
  status?: BonusStatus;
  employeeId?: string;
  year?: number;
  month?: number;
} = {}): Promise<BonusListItem[]> {
  const admin = createAdminClient();
  let q = admin
    .from("bonuses")
    .select(
      "id, employee_id, payroll_run_id, bonus_type, amount, effective_month, effective_year, description, status, approved_at, notes, employee:employees!bonuses_employee_id_fkey(first_name, last_name, employee_code)",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (params.status) q = q.eq("status", params.status);
  if (params.employeeId) q = q.eq("employee_id", params.employeeId);
  if (params.year) q = q.eq("effective_year", params.year);
  if (params.month) q = q.eq("effective_month", params.month);

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).map((b) => ({
    id: b.id,
    employeeId: b.employee_id,
    employeeName: empName(b.employee as Emp),
    employeeCode: (b.employee as Emp)?.employee_code ?? null,
    bonusType: b.bonus_type as BonusType,
    amount: num(b.amount),
    effectiveMonth: b.effective_month,
    effectiveYear: b.effective_year,
    description: b.description,
    status: b.status as BonusStatus,
    approvedAt: b.approved_at,
    payrollRunId: b.payroll_run_id,
    notes: b.notes,
  }));
}

export function computeBonusSummary(bonuses: BonusListItem[]): BonusSummary {
  const approved = bonuses.filter((b) => b.status === "approved" || b.status === "paid");
  return {
    pending: bonuses.filter((b) => b.status === "pending").length,
    approved: approved.length,
    totalApprovedAmount: approved.reduce((sum, b) => sum + b.amount, 0),
  };
}

export async function getApprovedBonusesForPeriod(
  year: number,
  month: number,
): Promise<{ employeeId: string; amount: number; id: string }[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("bonuses")
    .select("id, employee_id, amount")
    .is("deleted_at", null)
    .eq("status", "approved")
    .is("payroll_run_id", null)
    .eq("effective_year", year)
    .eq("effective_month", month);

  return (data ?? []).map((b) => ({
    id: b.id,
    employeeId: b.employee_id,
    amount: num(b.amount),
  }));
}
