import type { Database } from "@/types/database.types";

type Tbl = Database["public"]["Tables"];

export type LeaveType = Tbl["leave_types"]["Row"];
export type LeaveBalance = Tbl["leave_balances"]["Row"];
export type LeaveRequest = Tbl["leave_requests"]["Row"];
export type LeaveRequestEvent = Tbl["leave_request_events"]["Row"];

export type LeaveStatus =
  | "pending"
  | "manager_approved"
  | "approved"
  | "rejected"
  | "cancelled";

export interface IdNameOption {
  id: string;
  name: string;
}

export interface LeaveRequestListItem {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeColor: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  isHalfDay: boolean;
  status: LeaveStatus;
  reason: string | null;
  createdAt: string;
}

export interface LeaveTimelineEvent {
  id: string;
  action: string;
  note: string | null;
  actorName: string | null;
  createdAt: string;
}

export interface LeaveRequestDetail extends LeaveRequestListItem {
  halfDayPeriod: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  managerName: string | null;
  leaveTypeIsPaid: boolean;
  events: LeaveTimelineEvent[];
}

export interface LeaveBalanceItem {
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeColor: string;
  allocated: number;
  carriedForward: number;
  used: number;
  pending: number;
  available: number;
}

export interface LeaveFormOptions {
  leaveTypes: {
    id: string;
    name: string;
    requiresAttachment: boolean;
    genderRestriction: string | null;
  }[];
  employees: IdNameOption[];
}

export interface LeaveCalendarEntry {
  id: string;
  employeeName: string;
  leaveTypeName: string;
  leaveTypeColor: string;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  status: LeaveStatus;
}

export interface LeaveDashboardData {
  pending: number;
  onLeaveToday: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  byType: { name: string; value: number }[];
  byMonth: { label: string; value: number }[];
}
