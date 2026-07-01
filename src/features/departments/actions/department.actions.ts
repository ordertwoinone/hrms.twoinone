"use server";

import { revalidatePath } from "next/cache";

import { createAction, ActionError } from "@/server/safe-action";
import { recordAudit } from "@/server/audit";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createDepartmentSchema,
  deleteDepartmentSchema,
  setDepartmentStatusSchema,
  updateDepartmentSchema,
} from "../schemas/department.schema";

type AdminClient = ReturnType<typeof createAdminClient>;

const norm = (v: string | undefined) => (v && v.length > 0 ? v : null);

async function getPrimaryCompanyId(admin: AdminClient): Promise<string> {
  const { data } = await admin
    .from("companies")
    .select("id")
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data) {
    throw new ActionError(
      "No company is configured yet. Set up the company first.",
    );
  }
  return data.id;
}

/** Would setting `id`'s parent to `parentId` create a cycle? */
async function wouldCreateCycle(
  admin: AdminClient,
  id: string,
  parentId: string,
): Promise<boolean> {
  if (parentId === id) return true;
  const { data } = await admin
    .from("departments")
    .select("id, parent_id")
    .is("deleted_at", null);

  const parentOf = new Map((data ?? []).map((d) => [d.id, d.parent_id]));
  const guard = new Set<string>();
  let current: string | null = parentId;
  while (current) {
    if (current === id) return true; // `id` is an ancestor of the new parent
    if (guard.has(current)) break;
    guard.add(current);
    current = parentOf.get(current) ?? null;
  }
  return false;
}

/** Create a department. */
export const createDepartment = createAction({
  input: createDepartmentSchema,
  permission: PERMISSIONS.DEPARTMENT_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const company_id = await getPrimaryCompanyId(admin);

    const { data, error } = await admin
      .from("departments")
      .insert({
        company_id,
        name: input.name,
        code: input.code.toUpperCase(),
        description: norm(input.description),
        branch_id: norm(input.branch_id),
        head_id: norm(input.head_id),
        parent_id: norm(input.parent_id),
        status: input.status,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        throw new ActionError("A department with this code already exists.");
      }
      throw new ActionError(error.message);
    }

    await recordAudit({
      actorId: user.id,
      action: "create",
      entity: "departments",
      entityId: data.id,
      after: { name: input.name, code: input.code.toUpperCase() },
    });

    revalidatePath(ROUTES.departments);
    return { id: data.id };
  },
});

/** Update a department (with hierarchy cycle protection). */
export const updateDepartment = createAction({
  input: updateDepartmentSchema,
  permission: PERMISSIONS.DEPARTMENT_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();

    const { data: before } = await admin
      .from("departments")
      .select("*")
      .eq("id", input.id)
      .is("deleted_at", null)
      .maybeSingle();
    if (!before) throw new ActionError("Department not found.");

    const parentId = norm(input.parent_id);
    if (parentId && (await wouldCreateCycle(admin, input.id, parentId))) {
      throw new ActionError(
        "A department can’t be its own parent or a descendant of itself.",
      );
    }

    const update = {
      name: input.name,
      code: input.code.toUpperCase(),
      description: norm(input.description),
      branch_id: norm(input.branch_id),
      head_id: norm(input.head_id),
      parent_id: parentId,
      status: input.status,
      updated_by: user.id,
    };

    const { error } = await admin
      .from("departments")
      .update(update)
      .eq("id", input.id);

    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        throw new ActionError("A department with this code already exists.");
      }
      throw new ActionError(error.message);
    }

    await recordAudit({
      actorId: user.id,
      action: "update",
      entity: "departments",
      entityId: input.id,
      before,
      after: update,
    });

    revalidatePath(ROUTES.departments);
    return { id: input.id };
  },
});

/** Activate / deactivate a department. */
export const setDepartmentStatus = createAction({
  input: setDepartmentStatusSchema,
  permission: PERMISSIONS.DEPARTMENT_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("departments")
      .update({ status: input.status, updated_by: user.id })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);

    await recordAudit({
      actorId: user.id,
      action: "update",
      entity: "departments",
      entityId: input.id,
      after: { status: input.status },
    });

    revalidatePath(ROUTES.departments);
    return { id: input.id };
  },
});

/** Soft-delete a department. Blocked while it still has sub-departments. */
export const deleteDepartment = createAction({
  input: deleteDepartmentSchema,
  permission: PERMISSIONS.DEPARTMENT_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();

    const { count } = await admin
      .from("departments")
      .select("id", { count: "exact", head: true })
      .eq("parent_id", input.id)
      .is("deleted_at", null);
    if ((count ?? 0) > 0) {
      throw new ActionError(
        "Move or remove this department’s sub-departments first.",
      );
    }

    const { error } = await admin
      .from("departments")
      .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);

    await recordAudit({
      actorId: user.id,
      action: "delete",
      entity: "departments",
      entityId: input.id,
    });

    revalidatePath(ROUTES.departments);
    return { id: input.id };
  },
});
