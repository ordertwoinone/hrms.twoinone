import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { daysUntil, expiryLevel } from "../constants";
import type {
  VisaDashboardData,
  VisaDetail,
  VisaFormOptions,
  VisaListItem,
  VisaStatus,
} from "../types";

/**
 * Visa reads use the service-role admin client (they join employee names, which
 * RLS restricts). Access is gated by the route's `requirePermission('visa:view')`.
 */
const VISA_SELECT =
  "id, employee_id, visa_number, visa_type, sponsor, passport_number, issue_date, expiry_date, renewal_date, status, notes, attachment_url, attachment_name, created_at, updated_at, employee:employees(first_name, last_name, employee_code)";

type VisaRow = {
  id: string;
  employee_id: string;
  visa_number: string;
  visa_type: string;
  sponsor: string | null;
  passport_number: string | null;
  issue_date: string;
  expiry_date: string;
  renewal_date: string | null;
  status: string;
  notes: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  created_at: string;
  updated_at: string;
  employee: {
    first_name: string;
    last_name: string;
    employee_code: string | null;
  } | null;
};

function toListItem(row: VisaRow): VisaListItem {
  const status = row.status as VisaStatus;
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee
      ? `${row.employee.first_name} ${row.employee.last_name}`
      : "—",
    employeeCode: row.employee?.employee_code ?? null,
    visaNumber: row.visa_number,
    visaType: row.visa_type,
    sponsor: row.sponsor,
    passportNumber: row.passport_number,
    issueDate: row.issue_date,
    expiryDate: row.expiry_date,
    renewalDate: row.renewal_date,
    status,
    notes: row.notes,
    daysToExpiry: daysUntil(row.expiry_date),
    expiryLevel: expiryLevel(row.expiry_date, status),
    hasAttachment: !!row.attachment_url,
    attachmentName: row.attachment_name,
  };
}

export async function getVisas(): Promise<VisaListItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("visas")
    .select(VISA_SELECT)
    .is("deleted_at", null)
    .order("expiry_date", { ascending: true });
  if (error) throw error;
  return (data as VisaRow[] | null ?? []).map(toListItem);
}

export async function getVisaById(id: string): Promise<VisaDetail | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("visas")
    .select(VISA_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) return null;
  const row = data as VisaRow;
  return {
    ...toListItem(row),
    attachmentUrl: row.attachment_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getVisaFormOptions(): Promise<VisaFormOptions> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("employees")
    .select("id, first_name, last_name, employee_code")
    .is("deleted_at", null)
    .order("first_name");
  return {
    employees: (data ?? []).map((e) => ({
      id: e.id,
      name: `${e.first_name} ${e.last_name}`,
      code: e.employee_code,
    })),
  };
}

export async function getVisaDashboard(): Promise<VisaDashboardData> {
  const items = await getVisas();

  const byType = new Map<string, number>();
  const byStatus = new Map<string, number>();
  let active = 0;
  let expired = 0;
  let within30 = 0;
  let within60 = 0;
  let within90 = 0;

  for (const v of items) {
    byType.set(v.visaType, (byType.get(v.visaType) ?? 0) + 1);
    byStatus.set(v.status, (byStatus.get(v.status) ?? 0) + 1);
    if (v.status === "active") active += 1;
    switch (v.expiryLevel) {
      case "expired":
        expired += 1;
        break;
      case "critical":
        within30 += 1;
        break;
      case "warning":
        within60 += 1;
        break;
      case "notice":
        within90 += 1;
        break;
    }
  }

  const expiringSoon = items
    .filter((v) => v.expiryLevel !== "ok")
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry)
    .slice(0, 8);

  return {
    total: items.length,
    active,
    expired,
    within30,
    within60,
    within90,
    byType: [...byType.entries()].map(([name, value]) => ({ name, value })),
    byStatus: [...byStatus.entries()].map(([name, value]) => ({ name, value })),
    expiringSoon,
  };
}

/** Visas expiring within `withinDays` (or already expired), soonest first. */
export async function getExpiringVisas(
  withinDays: number,
): Promise<VisaListItem[]> {
  const items = await getVisas();
  return items
    .filter(
      (v) =>
        (v.status === "active" || v.status === "in_process") &&
        v.daysToExpiry <= withinDays,
    )
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
}
