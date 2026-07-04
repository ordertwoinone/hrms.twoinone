import type { Database } from "@/types/database.types";
import type { LeaveBalanceItem } from "@/features/leave/types";

type Tbl = Database["public"]["Tables"];

export type HrLetterRequest = Tbl["hr_letter_requests"]["Row"];
export type Announcement = Tbl["announcements"]["Row"];
export type NotificationRow = Tbl["notifications"]["Row"];

export type LetterStatus = "pending" | "processing" | "ready" | "rejected";

export interface EssProfile {
  id: string;
  code: string;
  fullName: string;
  workEmail: string | null;
  personalEmail: string | null;
  phone: string | null;
  gender: string | null;
  maritalStatus: string | null;
  dateOfJoining: string | null;
  status: string;
  photoUrl: string | null;
  addressLine: string | null;
  city: string | null;
  country: string | null;
  department: string | null;
  designation: string | null;
  branch: string | null;
}

export interface EssLeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
}

export interface EssAttendance {
  date: string;
  status: string;
  workMinutes: number;
  lateMinutes: number;
}

export interface EssPayslip {
  id: string;
  runId: string;
  periodLabel: string;
  employeeName: string;
  basic: number;
  housing: number;
  transport: number;
  other: number;
  overtime: number;
  bonus: number;
  commission: number;
  gross: number;
  deductions: number;
  loanDeduction: number;
  tax: number;
  net: number;
  currency: string;
  status: string;
}

export interface EssDocument {
  id: string;
  title: string;
  category: string | null;
  documentType: string | null;
  fileName: string | null;
  expiryDate: string | null;
}

export interface EssLetter {
  id: string;
  letterType: string;
  addressedTo: string | null;
  purpose: string | null;
  status: LetterStatus;
  hrNotes: string | null;
  hasAttachment: boolean;
  createdAt: string;
}

export interface EssAnnouncement {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  publishedAt: string;
}

export interface EssNotification {
  id: string;
  title: string;
  body: string | null;
  type: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface LeaveTypeOption {
  id: string;
  name: string;
  requiresAttachment: boolean;
  genderRestriction: string | null;
}

export interface SelfServiceData {
  profile: EssProfile | null;
  leaveBalances: LeaveBalanceItem[];
  leaveRequests: EssLeaveRequest[];
  attendance: EssAttendance[];
  payslips: EssPayslip[];
  documents: EssDocument[];
  letters: EssLetter[];
  leaveTypes: LeaveTypeOption[];
  announcements: EssAnnouncement[];
  notifications: EssNotification[];
  unreadCount: number;
}
