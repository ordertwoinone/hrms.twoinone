import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AttendanceFormOptions,
  AttendanceListItem,
  AttendanceSummary,
  ShiftItem,
} from "../types";

const ATT_SELECT =
  "id, employee_id, attendance_date, check_in, check_out, status, work_minutes, late_minutes, overtime_minutes, notes, shift_id, employee:employees!attendance_employee_id_fkey(first_name, last_name, employee_code, department:departments(name)), shift:shifts!attendance_shift_id_fkey(name)";

function toListItem(row: {
  id: string;
  employee_id: string;
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  work_minutes: number;
  late_minutes: number;
  overtime_minutes: number;
  notes: string | null;
  shift_id: string | null;
  employee: { first_name: string; last_name: string; employee_code: string; department: { name: string } | null } | null;
  shift: { name: string } | null;
}): AttendanceListItem {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee ? `${row.employee.first_name} ${row.employee.last_name}` : "—",
    employeeCode: row.employee?.employee_code ?? "—",
    department: row.employee?.department?.name ?? "—",
    attendanceDate: row.attendance_date,
    checkIn: row.check_in,
    checkOut: row.check_out,
    status: row.status as AttendanceListItem["status"],
    workMinutes: row.work_minutes,
    lateMinutes: row.late_minutes,
    overtimeMinutes: row.overtime_minutes,
    shiftName: row.shift?.name ?? null,
    notes: row.notes,
  };
}

export async function getAttendanceLogs(
  params: { month: string; employeeId?: string; status?: string } = { month: new Date().toISOString().slice(0, 7) },
): Promise<AttendanceListItem[]> {
  const admin = createAdminClient();
  const [year, mo] = params.month.split("-").map(Number);
  const monthStart = `${year}-${String(mo).padStart(2, "0")}-01`;
  const monthEnd = new Date(Date.UTC(year!, mo!, 0)).toISOString().slice(0, 10);

  let q = admin
    .from("attendance")
    .select(ATT_SELECT)
    .is("deleted_at", null)
    .gte("attendance_date", monthStart)
    .lte("attendance_date", monthEnd)
    .order("attendance_date", { ascending: false })
    .order("employee_id");

  if (params.employeeId) q = q.eq("employee_id", params.employeeId);
  if (params.status) q = q.eq("status", params.status);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(toListItem);
}

export async function getAttendanceSummary(
  month: string,
  employeeId?: string,
): Promise<AttendanceSummary> {
  const rows = await getAttendanceLogs({ month, employeeId });

  const counts = { present: 0, absent: 0, late: 0, half_day: 0, on_leave: 0, holiday: 0, weekend: 0 };
  let totalOT = 0;

  for (const r of rows) {
    const s = r.status as keyof typeof counts;
    if (s in counts) counts[s] = (counts[s] ?? 0) + 1;
    totalOT += r.overtimeMinutes;
  }

  const workDays = counts.present + counts.absent + counts.late + counts.half_day;
  const attended = counts.present + counts.late + counts.half_day * 0.5;

  return {
    totalDays: rows.length,
    present: counts.present,
    absent: counts.absent,
    late: counts.late,
    halfDay: counts.half_day,
    onLeave: counts.on_leave,
    totalOvertimeHours: Math.round((totalOT / 60) * 10) / 10,
    attendanceRate: workDays > 0 ? Math.round((attended / workDays) * 100) : 0,
  };
}

export async function getShifts(): Promise<ShiftItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("shifts")
    .select("id, name, code, start_time, end_time, break_minutes, grace_minutes, status")
    .is("deleted_at", null)
    .order("name");
  if (error) throw error;
  return (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    startTime: s.start_time,
    endTime: s.end_time,
    breakMinutes: s.break_minutes,
    graceMinutes: s.grace_minutes,
    status: s.status,
    employeeCount: 0,
  }));
}

export async function getAttendanceFormOptions(): Promise<AttendanceFormOptions> {
  const admin = createAdminClient();
  const [employees, shifts] = await Promise.all([
    admin
      .from("employees")
      .select("id, first_name, last_name, employee_code")
      .is("deleted_at", null)
      .eq("status", "active")
      .order("first_name"),
    admin
      .from("shifts")
      .select("id, name")
      .is("deleted_at", null)
      .eq("status", "active")
      .order("name"),
  ]);
  return {
    employees: (employees.data ?? []).map((e) => ({
      id: e.id,
      name: `${e.first_name} ${e.last_name}`,
      code: e.employee_code,
    })),
    shifts: shifts.data ?? [],
  };
}
