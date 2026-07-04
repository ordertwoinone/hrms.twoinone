import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { contractExpiryLevel, daysUntil } from "../constants";
import type {
  ContractDashboardData,
  ContractDetail,
  ContractFormOptions,
  ContractListItem,
  ContractStatus,
} from "../types";

/**
 * Contract reads use the service-role admin client (they join employee names
 * and event actors from `profiles`, which RLS restricts). Access is gated by
 * the route's `requirePermission('contract:view')` guard.
 */
const CONTRACT_SELECT =
  "id, employee_id, contract_type, start_date, end_date, notice_period_days, renewal_date, status, notes, offer_letter_url, offer_letter_name, contract_url, contract_name, attachment_url, attachment_name, submitted_at, approved_by, approved_at, created_at, updated_at, employee:employees(first_name, last_name, employee_code)";

type ContractRow = {
  id: string;
  employee_id: string;
  contract_type: string;
  start_date: string;
  end_date: string | null;
  notice_period_days: number;
  renewal_date: string | null;
  status: string;
  notes: string | null;
  offer_letter_url: string | null;
  offer_letter_name: string | null;
  contract_url: string | null;
  contract_name: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  employee: {
    first_name: string;
    last_name: string;
    employee_code: string | null;
  } | null;
};

function toListItem(row: ContractRow): ContractListItem {
  const status = row.status as ContractStatus;
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee
      ? `${row.employee.first_name} ${row.employee.last_name}`
      : "—",
    employeeCode: row.employee?.employee_code ?? null,
    contractType: row.contract_type,
    startDate: row.start_date,
    endDate: row.end_date,
    noticePeriodDays: row.notice_period_days,
    renewalDate: row.renewal_date,
    status,
    notes: row.notes,
    daysToExpiry: row.end_date ? daysUntil(row.end_date) : null,
    expiryLevel: contractExpiryLevel(row.end_date, status),
    hasOfferLetter: !!row.offer_letter_url,
    hasContract: !!row.contract_url,
    hasAttachment: !!row.attachment_url,
  };
}

export async function getContracts(): Promise<ContractListItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("contracts")
    .select(CONTRACT_SELECT)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data as ContractRow[] | null) ?? []).map(toListItem);
}

export async function getContractById(
  id: string,
): Promise<ContractDetail | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("contracts")
    .select(CONTRACT_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) return null;
  const row = data as ContractRow;

  const { data: eventRows } = await admin
    .from("contract_events")
    .select("id, action, note, created_at, actor_id")
    .eq("contract_id", id)
    .order("created_at", { ascending: true });

  const actorIds = [
    ...new Set(
      [...(eventRows ?? []).map((e) => e.actor_id), row.approved_by].filter(
        (v): v is string => !!v,
      ),
    ),
  ];
  const actors = new Map<string, string>();
  if (actorIds.length) {
    const { data: profs } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("id", actorIds);
    for (const p of profs ?? []) actors.set(p.id, p.full_name);
  }

  return {
    ...toListItem(row),
    offerLetterName: row.offer_letter_name,
    contractName: row.contract_name,
    attachmentName: row.attachment_name,
    submittedAt: row.submitted_at,
    approvedByName: row.approved_by
      ? (actors.get(row.approved_by) ?? null)
      : null,
    approvedAt: row.approved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    events: (eventRows ?? []).map((e) => ({
      id: e.id,
      action: e.action,
      note: e.note,
      actorName: e.actor_id ? (actors.get(e.actor_id) ?? null) : null,
      createdAt: e.created_at,
    })),
  };
}

export async function getContractFormOptions(): Promise<ContractFormOptions> {
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

export async function getContractDashboard(): Promise<ContractDashboardData> {
  const items = await getContracts();

  const byType = new Map<string, number>();
  const byStatus = new Map<string, number>();
  let active = 0;
  let pendingApprovals = 0;
  let expired = 0;
  let within30 = 0;
  let within60 = 0;
  let within90 = 0;

  for (const c of items) {
    byType.set(c.contractType, (byType.get(c.contractType) ?? 0) + 1);
    byStatus.set(c.status, (byStatus.get(c.status) ?? 0) + 1);
    if (c.status === "active") active += 1;
    if (c.status === "pending") pendingApprovals += 1;
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
    .filter((c) => c.expiryLevel !== "ok" || c.status === "pending")
    .sort((a, b) => {
      const ad = a.daysToExpiry ?? Number.POSITIVE_INFINITY;
      const bd = b.daysToExpiry ?? Number.POSITIVE_INFINITY;
      return ad - bd;
    })
    .slice(0, 8);

  return {
    total: items.length,
    active,
    pendingApprovals,
    expired,
    within30,
    within60,
    within90,
    byType: [...byType.entries()].map(([name, value]) => ({ name, value })),
    byStatus: [...byStatus.entries()].map(([name, value]) => ({ name, value })),
    expiringSoon,
  };
}

/** Active contracts expiring within `withinDays` (or already expired), soonest first. */
export async function getExpiringContracts(
  withinDays: number,
): Promise<ContractListItem[]> {
  const items = await getContracts();
  return items
    .filter(
      (c) =>
        c.status === "active" &&
        c.daysToExpiry !== null &&
        c.daysToExpiry <= withinDays,
    )
    .sort((a, b) => (a.daysToExpiry ?? 0) - (b.daysToExpiry ?? 0));
}
