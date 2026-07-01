import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  DepartmentFormOptions,
  DepartmentListItem,
  DepartmentStatus,
} from "../types";

/**
 * Department reads use the service-role admin client because the list joins
 * branch/head/parent names (the head comes from `profiles`, which RLS restricts
 * to `user:view` holders). Access is gated by the route's
 * `requirePermission('department:view')` guard.
 */
// Parent names are resolved from the fetched list (not a self-join) to avoid
// the supabase-js type quirk where a self-referencing embed is typed as array.
const DEPARTMENT_SELECT =
  "id, name, code, description, branch_id, head_id, parent_id, status, created_at, branch:branches(name), head:profiles(full_name)";

type DepartmentRow = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  branch_id: string | null;
  head_id: string | null;
  parent_id: string | null;
  status: string;
  created_at: string;
  branch: { name: string } | null;
  head: { full_name: string } | null;
};

function toListItem(row: DepartmentRow): DepartmentListItem {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    branchId: row.branch_id,
    branchName: row.branch?.name ?? null,
    headId: row.head_id,
    headName: row.head?.full_name ?? null,
    parentId: row.parent_id,
    parentName: null, // resolved from the list in getDepartments
    status: row.status as DepartmentStatus,
    depth: 0,
    createdAt: row.created_at,
  };
}

/**
 * All non-deleted departments, ordered as a hierarchy (parents before their
 * children, siblings A→Z) with `depth` set for indentation. Departments whose
 * parent was removed are surfaced as top-level entries.
 */
export async function getDepartments(): Promise<DepartmentListItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("departments")
    .select(DEPARTMENT_SELECT)
    .is("deleted_at", null);

  if (error) throw error;

  const items = (data ?? []).map(toListItem);

  // Resolve parent names from the list itself.
  const nameById = new Map(items.map((it) => [it.id, it.name]));
  for (const item of items) {
    item.parentName = item.parentId
      ? (nameById.get(item.parentId) ?? null)
      : null;
  }

  // Group by parent and order siblings alphabetically.
  const byParent = new Map<string | null, DepartmentListItem[]>();
  for (const item of items) {
    const key = item.parentId;
    const bucket = byParent.get(key);
    if (bucket) bucket.push(item);
    else byParent.set(key, [item]);
  }
  for (const bucket of byParent.values()) {
    bucket.sort((a, b) => a.name.localeCompare(b.name));
  }

  const ordered: DepartmentListItem[] = [];
  const seen = new Set<string>();
  const walk = (parentId: string | null, depth: number) => {
    for (const child of byParent.get(parentId) ?? []) {
      if (seen.has(child.id)) continue;
      seen.add(child.id);
      child.depth = depth;
      ordered.push(child);
      walk(child.id, depth + 1);
    }
  };

  walk(null, 0);
  // Orphans (parent soft-deleted) become top-level.
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      item.depth = 0;
      ordered.push(item);
      walk(item.id, 1);
    }
  }

  return ordered;
}

/** Branch and head (user) options for the department form. */
export async function getDepartmentFormOptions(): Promise<DepartmentFormOptions> {
  const admin = createAdminClient();

  const [{ data: branches }, { data: heads }] = await Promise.all([
    admin
      .from("branches")
      .select("id, name")
      .is("deleted_at", null)
      .eq("status", "active")
      .order("name", { ascending: true }),
    admin
      .from("profiles")
      .select("id, full_name")
      .is("deleted_at", null)
      .eq("status", "active")
      .order("full_name", { ascending: true }),
  ]);

  return {
    branches: (branches ?? []).map((b) => ({ id: b.id, name: b.name })),
    heads: (heads ?? []).map((h) => ({ id: h.id, name: h.full_name })),
  };
}
