import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { EmploymentTypeListItem, EmploymentTypeStatus } from "../types";

/**
 * Employment types have no restricted joins, so reads run under the caller's
 * RLS session (gated by `employment_type:view`). System defaults are listed
 * first, then alphabetically.
 */
export async function getEmploymentTypes(): Promise<EmploymentTypeListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employment_types")
    .select("id, name, description, status, is_system, created_at")
    .is("deleted_at", null)
    .order("is_system", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status as EmploymentTypeStatus,
    isSystem: row.is_system,
    createdAt: row.created_at,
  }));
}
