import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { daysUntil, expiryLevel } from "../constants";
import type {
  LabourCardDashboardData,
  LabourCardDetail,
  LabourCardFormOptions,
  LabourCardListItem,
  LabourCardStatus,
} from "../types";

/**
 * Labour card reads use the service-role admin client (they join employee
 * names, which RLS restricts). Access is gated by the route's
 * `requirePermission('labour_card:view')` guard.
 */
const CARD_SELECT =
  "id, employee_id, card_number, issue_date, expiry_date, renewal_date, status, notes, attachment_url, attachment_name, created_at, updated_at, employee:employees(first_name, last_name, employee_code)";

type CardRow = {
  id: string;
  employee_id: string;
  card_number: string;
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

function toListItem(row: CardRow): LabourCardListItem {
  const status = row.status as LabourCardStatus;
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee
      ? `${row.employee.first_name} ${row.employee.last_name}`
      : "—",
    employeeCode: row.employee?.employee_code ?? null,
    cardNumber: row.card_number,
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

export async function getLabourCards(): Promise<LabourCardListItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("labour_cards")
    .select(CARD_SELECT)
    .is("deleted_at", null)
    .order("expiry_date", { ascending: true });
  if (error) throw error;
  return ((data as CardRow[] | null) ?? []).map(toListItem);
}

export async function getLabourCardById(
  id: string,
): Promise<LabourCardDetail | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("labour_cards")
    .select(CARD_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) return null;
  const row = data as CardRow;
  return {
    ...toListItem(row),
    attachmentUrl: row.attachment_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getLabourCardFormOptions(): Promise<LabourCardFormOptions> {
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

export async function getLabourCardDashboard(): Promise<LabourCardDashboardData> {
  const items = await getLabourCards();

  const byStatus = new Map<string, number>();
  let active = 0;
  let expired = 0;
  let within30 = 0;
  let within60 = 0;
  let within90 = 0;

  for (const c of items) {
    byStatus.set(c.status, (byStatus.get(c.status) ?? 0) + 1);
    if (c.status === "active") active += 1;
    switch (c.expiryLevel) {
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
    .filter((c) => c.expiryLevel !== "ok")
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

/** Labour cards expiring within `withinDays` (or already expired), soonest first. */
export async function getExpiringLabourCards(
  withinDays: number,
): Promise<LabourCardListItem[]> {
  const items = await getLabourCards();
  return items
    .filter(
      (c) =>
        (c.status === "active" || c.status === "in_process") &&
        c.daysToExpiry <= withinDays,
    )
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
}
