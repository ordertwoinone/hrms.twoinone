import type { Database } from "@/types/database.types";

type Tbl = Database["public"]["Tables"];

export type Passport = Tbl["passports"]["Row"];

export type PassportStatus =
  | "active"
  | "in_process"
  | "renewed"
  | "cancelled"
  | "expired";

/** Derived expiry urgency used for badges, filters, and dashboard buckets. */
export type ExpiryLevel = "expired" | "critical" | "warning" | "notice" | "ok";

export interface IdNameOption {
  id: string;
  name: string;
}

export interface PassportListItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string | null;
  passportNumber: string;
  nationality: string;
  placeOfIssue: string | null;
  issueDate: string;
  expiryDate: string;
  renewalDate: string | null;
  status: PassportStatus;
  notes: string | null;
  daysToExpiry: number;
  expiryLevel: ExpiryLevel;
  hasAttachment: boolean;
  attachmentName: string | null;
}

export interface PassportDetail extends PassportListItem {
  attachmentUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PassportFormOptions {
  employees: {
    id: string;
    name: string;
    code: string | null;
  }[];
}

export interface PassportDashboardData {
  total: number;
  active: number;
  expired: number;
  /** Non-overlapping windows counted from today (active/in-process only). */
  within30: number;
  within60: number;
  within90: number;
  byStatus: { name: string; value: number }[];
  byNationality: { name: string; value: number }[];
  /** Records needing attention, soonest expiry first. */
  expiringSoon: PassportListItem[];
}
