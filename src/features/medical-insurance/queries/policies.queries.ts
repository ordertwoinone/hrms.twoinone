import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { daysUntil, expiryLevel } from "../constants";
import type {
  InsuranceDashboardData,
  PolicyDetail,
  PolicyFormOptions,
  PolicyListItem,
  PolicyStatus,
} from "../types";

/**
 * Policy reads use the service-role admin client (they join employee names,
 * which RLS restricts). Access is gated by the route's
 * `requirePermission('medical_insurance:view')` guard.
 */
const POLICY_SELECT =
  "id, employee_id, provider, policy_number, coverage, dependents_covered, issue_date, expiry_date, renewal_date, status, claims_notes, attachment_url, attachment_name, created_at, updated_at, employee:employees(first_name, last_name, employee_code)";

type PolicyRow = {
  id: string;
  employee_id: string;
  provider: string;
  policy_number: string;
  coverage: string;
  dependents_covered: number;
  issue_date: string;
  expiry_date: string;
  renewal_date: string | null;
  status: string;
  claims_notes: string | null;
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

function toListItem(row: PolicyRow): PolicyListItem {
  const status = row.status as PolicyStatus;
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee
      ? `${row.employee.first_name} ${row.employee.last_name}`
      : "—",
    employeeCode: row.employee?.employee_code ?? null,
    provider: row.provider,
    policyNumber: row.policy_number,
    coverage: row.coverage,
    dependentsCovered: row.dependents_covered,
    issueDate: row.issue_date,
    expiryDate: row.expiry_date,
    renewalDate: row.renewal_date,
    status,
    claimsNotes: row.claims_notes,
    daysToExpiry: daysUntil(row.expiry_date),
    expiryLevel: expiryLevel(row.expiry_date, status),
    hasAttachment: !!row.attachment_url,
    attachmentName: row.attachment_name,
  };
}

export async function getPolicies(): Promise<PolicyListItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("medical_insurance_policies")
    .select(POLICY_SELECT)
    .is("deleted_at", null)
    .order("expiry_date", { ascending: true });
  if (error) throw error;
  return ((data as PolicyRow[] | null) ?? []).map(toListItem);
}

export async function getPolicyById(id: string): Promise<PolicyDetail | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("medical_insurance_policies")
    .select(POLICY_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) return null;
  const row = data as PolicyRow;
  return {
    ...toListItem(row),
    attachmentUrl: row.attachment_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPolicyFormOptions(): Promise<PolicyFormOptions> {
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

export async function getInsuranceDashboard(): Promise<InsuranceDashboardData> {
  const items = await getPolicies();

  const byStatus = new Map<string, number>();
  const byProvider = new Map<string, number>();
  let active = 0;
  let expired = 0;
  let livesCovered = 0;
  let within30 = 0;
  let within60 = 0;
  let within90 = 0;

  for (const p of items) {
    byStatus.set(p.status, (byStatus.get(p.status) ?? 0) + 1);
    byProvider.set(p.provider, (byProvider.get(p.provider) ?? 0) + 1);
    if (p.status === "active") {
      active += 1;
      livesCovered += 1 + p.dependentsCovered;
    }
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
    livesCovered,
    within30,
    within60,
    within90,
    byStatus: [...byStatus.entries()].map(([name, value]) => ({ name, value })),
    byProvider: [...byProvider.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6),
    expiringSoon,
  };
}

/** Policies expiring within `withinDays` (or already expired), soonest first. */
export async function getExpiringPolicies(
  withinDays: number,
): Promise<PolicyListItem[]> {
  const items = await getPolicies();
  return items
    .filter(
      (p) =>
        (p.status === "active" || p.status === "in_process") &&
        p.daysToExpiry <= withinDays,
    )
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
}
