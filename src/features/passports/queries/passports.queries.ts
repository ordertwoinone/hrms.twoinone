import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { daysUntil, expiryLevel } from "../constants";
import type {
  PassportDashboardData,
  PassportDetail,
  PassportFormOptions,
  PassportListItem,
  PassportStatus,
} from "../types";

/**
 * Passport reads use the service-role admin client (they join employee names,
 * which RLS restricts). Access is gated by the route's
 * `requirePermission('passport:view')` guard.
 */
const PASSPORT_SELECT =
  "id, employee_id, passport_number, nationality, place_of_issue, issue_date, expiry_date, renewal_date, status, notes, attachment_url, attachment_name, created_at, updated_at, employee:employees(first_name, last_name, employee_code)";

type PassportRow = {
  id: string;
  employee_id: string;
  passport_number: string;
  nationality: string;
  place_of_issue: string | null;
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

function toListItem(row: PassportRow): PassportListItem {
  const status = row.status as PassportStatus;
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee
      ? `${row.employee.first_name} ${row.employee.last_name}`
      : "—",
    employeeCode: row.employee?.employee_code ?? null,
    passportNumber: row.passport_number,
    nationality: row.nationality,
    placeOfIssue: row.place_of_issue,
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

export async function getPassports(): Promise<PassportListItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("passports")
    .select(PASSPORT_SELECT)
    .is("deleted_at", null)
    .order("expiry_date", { ascending: true });
  if (error) throw error;
  return ((data as PassportRow[] | null) ?? []).map(toListItem);
}

export async function getPassportById(
  id: string,
): Promise<PassportDetail | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("passports")
    .select(PASSPORT_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) return null;
  const row = data as PassportRow;
  return {
    ...toListItem(row),
    attachmentUrl: row.attachment_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPassportFormOptions(): Promise<PassportFormOptions> {
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

export async function getPassportDashboard(): Promise<PassportDashboardData> {
  const items = await getPassports();

  const byStatus = new Map<string, number>();
  const byNationality = new Map<string, number>();
  let active = 0;
  let expired = 0;
  let within30 = 0;
  let within60 = 0;
  let within90 = 0;

  for (const p of items) {
    byStatus.set(p.status, (byStatus.get(p.status) ?? 0) + 1);
    byNationality.set(
      p.nationality,
      (byNationality.get(p.nationality) ?? 0) + 1,
    );
    if (p.status === "active") active += 1;
    switch (p.expiryLevel) {
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
    .filter((p) => p.expiryLevel !== "ok")
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry)
    .slice(0, 8);

  return {
    total: items.length,
    active,
    expired,
    within30,
    within60,
    within90,
    byStatus: [...byStatus.entries()].map(([name, value]) => ({ name, value })),
    byNationality: [...byNationality.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6),
    expiringSoon,
  };
}

/** Passports expiring within `withinDays` (or already expired), soonest first. */
export async function getExpiringPassports(
  withinDays: number,
): Promise<PassportListItem[]> {
  const items = await getPassports();
  return items
    .filter(
      (p) =>
        (p.status === "active" || p.status === "in_process") &&
        p.daysToExpiry <= withinDays,
    )
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
}
