import type { Database } from "@/types/database.types";

type Tbl = Database["public"]["Tables"];

export type Notification = Tbl["notifications"]["Row"];
export type NotificationPreferenceRow = Tbl["notification_preferences"]["Row"];

export type NotificationCategory =
  | "visa_expiry"
  | "passport_expiry"
  | "insurance_expiry"
  | "contract_expiry"
  | "document_expiry"
  | "birthday"
  | "work_anniversary"
  | "leave"
  | "payroll"
  | "system";

export interface NotificationItem {
  id: string;
  category: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface PreferenceItem {
  category: NotificationCategory;
  label: string;
  description: string;
  inApp: boolean;
  email: boolean;
}

export interface NotificationCenterData {
  items: NotificationItem[];
  unreadCount: number;
  preferences: PreferenceItem[];
}
