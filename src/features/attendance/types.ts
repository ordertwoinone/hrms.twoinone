import type { Database } from "@/types/database.types";

type Tbl = Database["public"]["Tables"];

export type AttendanceRow = Tbl["attendance"]["Row"];
export type ShiftRow = Tbl["shifts"]["Row"];

export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "half_day"
  | "on_leave"
  | "holiday"
  | "weekend";

export interface AttendanceListItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  attendanceDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  workMinutes: number;
  lateMinutes: number;
  overtimeMinutes: number;
  shiftName: string | null;
  notes: string | null;
}

export interface AttendanceSummary {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  onLeave: number;
  totalOvertimeHours: number;
  attendanceRate: number;
}

export interface ShiftItem {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  graceMinutes: number;
  status: string;
  employeeCount: number;
}

export interface AttendanceFormOptions {
  employees: { id: string; name: string; code: string }[];
  shifts: { id: string; name: string }[];
}
