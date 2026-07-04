import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface PayrollRunForWPS {
  id: string;
  periodMonth: number;
  periodYear: number;
  totalNet: number;
  status: string;
  approvedAt: string | null;
  employeeCount: number;
  createdAt: string;
}

export interface WpsConfig {
  agentId: string | null;
  employerId: string | null;
  bankRoutingCode: string | null;
  currency: string;
}

export async function getPayrollRunsForWPS(): Promise<PayrollRunForWPS[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("payroll_runs")
    .select("id, period_month, period_year, total_net, status, approved_at, created_at, employee_count")
    .in("status", ["approved", "paid"])
    .order("period_year", { ascending: false })
    .order("period_month", { ascending: false })
    .limit(24);

  return (data ?? []).map((r) => ({
    id: r.id,
    periodMonth: r.period_month,
    periodYear: r.period_year,
    totalNet: Number(r.total_net),
    status: r.status,
    approvedAt: r.approved_at,
    employeeCount: r.employee_count,
    createdAt: r.created_at,
  }));
}

export async function getWpsConfig(): Promise<WpsConfig | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("payroll_config")
    .select("agent_id, employer_id, bank_routing_code, currency")
    .maybeSingle();
  if (!data) return null;
  return {
    agentId: data.agent_id,
    employerId: data.employer_id,
    bankRoutingCode: data.bank_routing_code,
    currency: data.currency,
  };
}

export async function getEmployeeSalariesForRun(runId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("payslips")
    .select(
      "id, gross, deductions, net, employee:employees!payslips_employee_id_fkey(first_name, last_name, employee_number)",
    )
    .eq("run_id", runId);
  return data ?? [];
}
