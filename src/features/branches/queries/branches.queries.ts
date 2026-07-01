import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { BranchListItem, BranchStatus, ManagerOption } from "../types";

/**
 * Branch reads use the service-role admin client because the branch list joins
 * each manager's name from `profiles`, which RLS restricts to `user:view`
 * holders. Access is gated by the route's `requirePermission('branch:view')`
 * guard, so these reads are only reached by authorized users.
 */
const BRANCH_SELECT =
  "id, name, code, address_line, city, country, phone, email, manager_id, status, created_at, manager:profiles(full_name)";

function toListItem(row: {
  id: string;
  name: string;
  code: string;
  address_line: string | null;
  city: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  manager_id: string | null;
  status: string;
  created_at: string;
  manager: { full_name: string } | null;
}): BranchListItem {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    addressLine: row.address_line,
    city: row.city,
    country: row.country,
    phone: row.phone,
    email: row.email,
    managerId: row.manager_id,
    managerName: row.manager?.full_name ?? null,
    status: row.status as BranchStatus,
    createdAt: row.created_at,
  };
}

/** All non-deleted branches, newest first. */
export async function getBranches(): Promise<BranchListItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("branches")
    .select(BRANCH_SELECT)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toListItem);
}

/** Active users as manager options for the branch form. */
export async function getBranchManagerOptions(): Promise<ManagerOption[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, full_name")
    .is("deleted_at", null)
    .eq("status", "active")
    .order("full_name", { ascending: true });

  return (data ?? []).map((p) => ({ id: p.id, name: p.full_name }));
}
