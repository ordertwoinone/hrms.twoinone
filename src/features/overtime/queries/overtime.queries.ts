import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface OvertimeRequestItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  hoursRequested: number;
  reason: string | null;
  status: string;
  managerStatus: string | null;
  hrStatus: string | null;
  createdAt: string;
}

export interface OvertimeSummary {
  pending: number;
  approved: number;
  rejected: number;
  totalHoursApproved: number;
}

export async function getOvertimeRequests(params: {
  status?: string;
  employeeId?: string;
  month?: string;
} = {}): Promise<OvertimeRequestItem[]> {
  const admin = createAdminClient();
  let q = admin
    .from("overtime_requests")
    .select(
      "id, employee_id, date, start_time, end_time, hours_requested, reason, status, manager_status, hr_status, created_at, employee:employees!overtime_requests_employee_id_fkey(first_name, last_name, employee_code, department:departments(name))",
    )
    .is("deleted_at", null)
    .order("date", { ascending: false });

  if (params.status) q = q.eq("status", params.status);
  if (params.employeeId) q = q.eq("employee_id", params.employeeId);
  if (params.month) {
    const [y, m] = params.month.split("-").map(Number);
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const end = new Date(Date.UTC(y!, m!, 0)).toISOString().slice(0, 10);
    q = q.gte("date", start).lte("date", end);
  }

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    employeeId: r.employee_id,
    employeeName: r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : "—",
    employeeNumber: r.employee?.employee_code ?? "—",
    department: r.employee?.department?.name ?? "—",
    date: r.date,
    startTime: r.start_time,
    endTime: r.end_time,
    hoursRequested: Number(r.hours_requested),
    reason: r.reason,
    status: r.status,
    managerStatus: r.manager_status,
    hrStatus: r.hr_status,
    createdAt: r.created_at,
  }));
}

export async function getOvertimeSummary(): Promise<OvertimeSummary> {
  const rows = await getOvertimeRequests();
  let totalHours = 0;
  for (const r of rows) {
    if (r.status === "approved") totalHours += r.hoursRequested;
  }
  return {
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
    totalHoursApproved: Math.round(totalHours * 10) / 10,
  };
}
