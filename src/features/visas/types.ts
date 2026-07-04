import type { Database } from "@/types/database.types";

type Tbl = Database["public"]["Tables"];

export type Visa = Tbl["visas"]["Row"];

export type VisaStatus =
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

export interface VisaListItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string | null;
  visaNumber: string;
  visaType: string;
  sponsor: string | null;
  passportNumber: string | null;
  issueDate: string;
  expiryDate: string;
  renewalDate: string | null;
  status: VisaStatus;
  notes: string | null;
  daysToExpiry: number;
  expiryLevel: ExpiryLevel;
  hasAttachment: boolean;
  attachmentName: string | null;
}

export interface VisaDetail extends VisaListItem {
  attachmentUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VisaFormOptions {
  employees: {
    id: string;
    name: string;
    code: string | null;
  }[];
}

export interface VisaDashboardData {
  total: number;
  active: number;
  expired: number;
  /** Non-overlapping windows counted from today (active/in-process only). */
  within30: number;
  within60: number;
  within90: number;
  byType: { name: string; value: number }[];
  byStatus: { name: string; value: number }[];
  /** Visas needing attention, soonest expiry first. */
  expiringSoon: VisaListItem[];
}
