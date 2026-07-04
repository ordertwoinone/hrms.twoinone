import type { Database } from "@/types/database.types";

type Tbl = Database["public"]["Tables"];

export type Contract = Tbl["contracts"]["Row"];
export type ContractEvent = Tbl["contract_events"]["Row"];

export type ContractStatus =
  | "draft"
  | "pending"
  | "active"
  | "expired"
  | "terminated"
  | "renewed";

/** Derived expiry urgency used for badges, filters, and dashboard buckets. */
export type ExpiryLevel = "expired" | "critical" | "warning" | "notice" | "ok";

export interface IdNameOption {
  id: string;
  name: string;
}

export interface ContractListItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string | null;
  contractType: string;
  startDate: string;
  endDate: string | null;
  noticePeriodDays: number;
  renewalDate: string | null;
  status: ContractStatus;
  notes: string | null;
  daysToExpiry: number | null;
  expiryLevel: ExpiryLevel;
  hasOfferLetter: boolean;
  hasContract: boolean;
  hasAttachment: boolean;
}

export interface ContractTimelineEvent {
  id: string;
  action: string;
  note: string | null;
  actorName: string | null;
  createdAt: string;
}

export interface ContractDetail extends ContractListItem {
  offerLetterName: string | null;
  contractName: string | null;
  attachmentName: string | null;
  submittedAt: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  events: ContractTimelineEvent[];
}

export interface ContractFormOptions {
  employees: {
    id: string;
    name: string;
    code: string | null;
  }[];
}

export interface ContractDashboardData {
  total: number;
  active: number;
  pendingApprovals: number;
  expired: number;
  within30: number;
  within60: number;
  within90: number;
  byType: { name: string; value: number }[];
  byStatus: { name: string; value: number }[];
  /** Contracts needing attention (expiring or pending), soonest first. */
  expiringSoon: ContractListItem[];
}
