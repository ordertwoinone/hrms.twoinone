import type { Database } from "@/types/database.types";

type Tbl = Database["public"]["Tables"];

export type MedicalInsurance = Tbl["medical_insurance_policies"]["Row"];

export type PolicyStatus =
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

export interface PolicyListItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string | null;
  provider: string;
  policyNumber: string;
  coverage: string;
  dependentsCovered: number;
  issueDate: string;
  expiryDate: string;
  renewalDate: string | null;
  status: PolicyStatus;
  claimsNotes: string | null;
  daysToExpiry: number;
  expiryLevel: ExpiryLevel;
  hasAttachment: boolean;
  attachmentName: string | null;
}

export interface PolicyDetail extends PolicyListItem {
  attachmentUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyFormOptions {
  employees: {
    id: string;
    name: string;
    code: string | null;
  }[];
}

export interface InsuranceDashboardData {
  total: number;
  active: number;
  expired: number;
  /** Lives covered = active policyholders + their dependents. */
  livesCovered: number;
  /** Non-overlapping windows counted from today (active/in-process only). */
  within30: number;
  within60: number;
  within90: number;
  byStatus: { name: string; value: number }[];
  byProvider: { name: string; value: number }[];
  /** Policies needing attention, soonest expiry first. */
  expiringSoon: PolicyListItem[];
}
