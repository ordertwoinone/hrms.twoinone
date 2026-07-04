import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  IdNameOption,
  LeaveBalanceItem,
  LeaveCalendarEntry,
  LeaveDashboardData,
  LeaveFormOptions,
  LeaveRequestDetail,
  LeaveRequestListItem,
  LeaveStatus,
  LeaveType,
} from "../types";

/**
 * Leave reads use the service-role admin client (they join employee/type names
 * and event actors from `profiles`, which RLS restricts). Access is gated by
 * the route's `requirePermission('leave:view')` guard.
 */
const REQUEST_SELECT =
  "id, employee_id, leave_type_id, start_date, end_date, total_days, is_half_day, status, reason, created_at, employee:employees!leave_requests_employee_id_fkey(first_name, last_name), leave_type:leave_types(name, color)";

function toListItem(row: {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  is_half_day: boolean;
  status: string;
  reason: string | null;
  created_at: string;
  employee: { first_name: string; last_name: string } | null;
  leave_type: { name: string; color: string } | null;
}): LeaveRequestListItem {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee
      ? `${row.employee.first_name} ${row.employee.last_name}`
      : "—",
    leaveTypeId: row.leave_type_id,
    leaveTypeName: row.leave_type?.name ?? "—",
    leaveTypeColor: row.leave_type?.color ?? "default",
    startDate: row.start_date,
    endDate: row.end_date,
    totalDays: Number(row.total_days),
    isHalfDay: row.is_half_day,
    status: row.status as LeaveStatus,
    reason: row.reason,
    createdAt: row.created_at,
  };
}

export async function getLeaveRequests(): Promise<LeaveRequestListItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("leave_requests")
    .select(REQUEST_SELECT)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toListItem);
}

export async function getLeaveRequestById(
  id: string,
): Promise<LeaveRequestDetail | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("leave_requests")
    .select(
      `${REQUEST_SELECT}, half_day_period, attachment_url, attachment_name, manager_id, leave_type_detail:leave_types(is_paid)`,
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) return null;

  const base = toListItem(data);

  let managerName: string | null = null;
  if (data.manager_id) {
    const { data: mgr } = await admin
      .from("employees")
      .select("first_name, last_name")
      .eq("id", data.manager_id)
      .maybeSingle();
    if (mgr) managerName = `${mgr.first_name} ${mgr.last_name}`;
  }

  const { data: eventRows } = await admin
    .from("leave_request_events")
    .select("id, action, note, created_at, actor_id")
    .eq("request_id", id)
    .order("created_at", { ascending: true });

  const actorIds = [
    ...new Set(
      (eventRows ?? [])
        .map((e) => e.actor_id)
        .filter((v): v is string => !!v),
    ),
  ];
  const actors = new Map<string, string>();
  if (actorIds.length) {
    const { data: profs } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("id", actorIds);
    for (const p of profs ?? []) actors.set(p.id, p.full_name);
  }

  return {
    ...base,
    halfDayPeriod: data.half_day_period,
    attachmentUrl: data.attachment_url,
    attachmentName: data.attachment_name,
    managerName,
    leaveTypeIsPaid: data.leave_type_detail?.is_paid ?? true,
    events: (eventRows ?? []).map((e) => ({
      id: e.id,
      action: e.action,
      note: e.note,
      actorName: e.actor_id ? (actors.get(e.actor_id) ?? null) : null,
      createdAt: e.created_at,
    })),
  };
}

export async function getLeaveTypes(): Promise<LeaveType[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("leave_types")
    .select("*")
    .is("deleted_at", null)
    .order("name");
  return data ?? [];
}

export async function getLeaveFormOptions(): Promise<LeaveFormOptions> {
  const admin = createAdminClient();
  const [types, employees] = await Promise.all([
    admin
      .from("leave_types")
      .select("id, name, requires_attachment, gender_restriction")
      .is("deleted_at", null)
      .eq("status", "active")
      .order("name"),
    admin
      .from("employees")
      .select("id, first_name, last_name")
      .is("deleted_at", null)
      .order("first_name"),
  ]);
  return {
    leaveTypes: (types.data ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      requiresAttachment: t.requires_attachment,
      genderRestriction: t.gender_restriction,
    })),
    employees: (employees.data ?? []).map((e) => ({
      id: e.id,
      name: `${e.first_name} ${e.last_name}`,
    })),
  };
}

export async function getEmployeeOptions(): Promise<IdNameOption[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("employees")
    .select("id, first_name, last_name")
    .is("deleted_at", null)
    .order("first_name");
  return (data ?? []).map((e) => ({
    id: e.id,
    name: `${e.first_name} ${e.last_name}`,
  }));
}

export async function getLeaveBalances(
  employeeId: string,
  year: number,
): Promise<LeaveBalanceItem[]> {
  const admin = createAdminClient();
  const [types, balances, requests] = await Promise.all([
    admin
      .from("leave_types")
      .select("id, name, color, days_per_year")
      .is("deleted_at", null)
      .eq("status", "active")
      .order("name"),
    admin
      .from("leave_balances")
      .select("leave_type_id, allocated, carried_forward")
      .eq("employee_id", employeeId)
      .eq("year", year),
    admin
      .from("leave_requests")
      .select("leave_type_id, total_days, status, start_date")
      .eq("employee_id", employeeId)
      .is("deleted_at", null)
      .gte("start_date", `${year}-01-01`)
      .lte("start_date", `${year}-12-31`),
  ]);

  const balanceByType = new Map(
    (balances.data ?? []).map((b) => [b.leave_type_id, b]),
  );
  const used = new Map<string, number>();
  const pending = new Map<string, number>();
  for (const r of requests.data ?? []) {
    const days = Number(r.total_days);
    if (r.status === "approved") {
      used.set(r.leave_type_id, (used.get(r.leave_type_id) ?? 0) + days);
    } else if (r.status === "pending" || r.status === "manager_approved") {
      pending.set(r.leave_type_id, (pending.get(r.leave_type_id) ?? 0) + days);
    }
  }

  return (types.data ?? []).map((t) => {
    const bal = balanceByType.get(t.id);
    const allocated = bal ? Number(bal.allocated) : Number(t.days_per_year);
    const carried = bal ? Number(bal.carried_forward) : 0;
    const usedDays = used.get(t.id) ?? 0;
    const pendingDays = pending.get(t.id) ?? 0;
    return {
      leaveTypeId: t.id,
      leaveTypeName: t.name,
      leaveTypeColor: t.color,
      allocated,
      carriedForward: carried,
      used: usedDays,
      pending: pendingDays,
      available: allocated + carried - usedDays - pendingDays,
    };
  });
}

export async function getLeaveCalendar(
  year: number,
  month: number,
): Promise<{ leaves: LeaveCalendarEntry[]; holidays: { date: string; name: string }[] }> {
  const admin = createAdminClient();
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const monthEnd = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);

  const [reqs, holidays] = await Promise.all([
    admin
      .from("leave_requests")
      .select(
        "id, start_date, end_date, is_half_day, status, employee:employees!leave_requests_employee_id_fkey(first_name, last_name), leave_type:leave_types(name, color)",
      )
      .is("deleted_at", null)
      .in("status", ["approved", "manager_approved"])
      .lte("start_date", monthEnd)
      .gte("end_date", monthStart),
    admin
      .from("company_holidays")
      .select("name, holiday_date")
      .gte("holiday_date", monthStart)
      .lte("holiday_date", monthEnd),
  ]);

  return {
    leaves: (reqs.data ?? []).map((r) => ({
      id: r.id,
      employeeName: r.employee
        ? `${r.employee.first_name} ${r.employee.last_name}`
        : "—",
      leaveTypeName: r.leave_type?.name ?? "—",
      leaveTypeColor: r.leave_type?.color ?? "default",
      startDate: r.start_date,
      endDate: r.end_date,
      isHalfDay: r.is_half_day,
      status: r.status as LeaveStatus,
    })),
    holidays: (holidays.data ?? []).map((h) => ({
      date: h.holiday_date,
      name: h.name,
    })),
  };
}

export async function getLeaveDashboard(
  year: number,
): Promise<LeaveDashboardData> {
  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + "-01";

  const { data } = await admin
    .from("leave_requests")
    .select(
      "start_date, end_date, total_days, status, created_at, leave_type:leave_types(name)",
    )
    .is("deleted_at", null)
    .gte("start_date", `${year}-01-01`)
    .lte("start_date", `${year}-12-31`);

  const rows = data ?? [];
  const byType = new Map<string, number>();
  const byMonth = new Array(12).fill(0) as number[];
  let pending = 0;
  let onLeaveToday = 0;
  let approvedThisMonth = 0;
  let rejectedThisMonth = 0;

  for (const r of rows) {
    if (r.status === "pending" || r.status === "manager_approved") pending += 1;
    if (r.status === "approved") {
      if (today >= r.start_date && today <= r.end_date) onLeaveToday += 1;
      const name = r.leave_type?.name ?? "Other";
      byType.set(name, (byType.get(name) ?? 0) + Number(r.total_days));
      const m = Number(r.start_date.slice(5, 7)) - 1;
      if (m >= 0 && m < 12) byMonth[m] = (byMonth[m] ?? 0) + Number(r.total_days);
      if (r.start_date >= monthStart) approvedThisMonth += 1;
    }
    if (r.status === "rejected" && r.created_at.slice(0, 10) >= monthStart) {
      rejectedThisMonth += 1;
    }
  }

  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return {
    pending,
    onLeaveToday,
    approvedThisMonth,
    rejectedThisMonth,
    byType: [...byType.entries()].map(([name, value]) => ({ name, value })),
    byMonth: byMonth.map((value, i) => ({ label: monthLabels[i]!, value })),
  };
}
