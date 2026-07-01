import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  DesignationListItem,
  DesignationStatus,
  IdNameOption,
} from "../types";

/**
 * Designation reads use the service-role admin client (the list joins the
 * department name). Access is gated by the route's
 * `requirePermission('designation:view')` guard.
 */
const DESIGNATION_SELECT =
  "id, name, department_id, grade, description, status, created_at, department:departments(name)";

/** All non-deleted designations, A→Z. */
export async function getDesignations(): Promise<DesignationListItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("designations")
    .select(DESIGNATION_SELECT)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    departmentId: row.department_id,
    departmentName: row.department?.name ?? null,
    grade: row.grade,
    description: row.description,
    status: row.status as DesignationStatus,
    createdAt: row.created_at,
  }));
}

/** Active departments as options for the designation form and filter. */
export async function getDesignationDepartmentOptions(): Promise<
  IdNameOption[]
> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("departments")
    .select("id, name")
    .is("deleted_at", null)
    .eq("status", "active")
    .order("name", { ascending: true });

  return (data ?? []).map((d) => ({ id: d.id, name: d.name }));
}
