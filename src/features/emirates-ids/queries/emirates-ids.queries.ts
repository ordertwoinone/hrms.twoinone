import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { daysUntil, expiryLevel } from "../constants";
import type {
  EidDashboardData,
  EidDetail,
  EidFormOptions,
  EidListItem,
  EidStatus,
} from "../types";

/**
 * Emirates ID reads use the service-role admin client (they join employee
 * names, which RLS restricts). Access is gated by the route's
 * `requirePermission('emirates_id:view')` guard.
 */
const EID_SELECT =
  "id, employee_id, eid_number, issue_date, expiry_date, renewal_date, status, notes, attachment_url, attachment_name, created_at, updated_at, employee:employees(first_name, last_name, employee_code)";

type EidRow = {
  id: string;
  employee_id: string;
  eid_number: string;
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

function toListItem(row: EidRow): EidListItem {
  const status = row.status as EidStatus;
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee
      ? `${row.employee.first_name} ${row.employee.last_name}`
      : "—",
    employeeCode: row.employee?.employee_code ?? null,
    eidNumber: row.eid_number,
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

export async function getEmiratesIds(): Promise<EidListItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("emirates_ids")
    .select(EID_SELECT)
    .is("deleted_at", null)
    .order("expiry_date", { ascending: true });
  if (error) throw error;
  return ((data as EidRow[] | null) ?? []).map(toListItem);
}

export async function getEmiratesIdById(id: string): Promise<EidDetail | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("emirates_ids")
    .select(EID_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) return null;
  const row = data as EidRow;
  return {
    ...toListItem(row),
    attachmentUrl: row.attachment_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getEmiratesIdFormOptions(): Promise<EidFormOptions> {
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

export async function getEmiratesIdDashboard(): Promise<EidDashboardData> {
  const items = await getEmiratesIds();

  const byStatus = new Map<string, number>();
  let active = 0;
  let expired = 0;
  let within30 = 0;
  let within60 = 0;
  let within90 = 0;

  for (const e of items) {
    byStatus.set(e.status, (byStatus.get(e.status) ?? 0) + 1);
    if (e.status === "active") active += 1;
    switch (e.expiryLevel) {
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
    .filter((e) => e.expiryLevel !== "ok")
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
    expiringSoon,
  };
}

/** Emirates IDs expiring within `withinDays` (or already expired), soonest first. */
export async function getExpiringEmiratesIds(
  withinDays: number,
): Promise<EidListItem[]> {
  const items = await getEmiratesIds();
  return items
    .filter(
      (e) =>
        (e.status === "active" || e.status === "in_process") &&
        e.daysToExpiry <= withinDays,
    )
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
}
