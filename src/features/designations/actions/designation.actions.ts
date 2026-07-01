"use server";

import { revalidatePath } from "next/cache";

import { createAction, ActionError } from "@/server/safe-action";
import { recordAudit } from "@/server/audit";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createDesignationSchema,
  deleteDesignationSchema,
  setDesignationStatusSchema,
  updateDesignationSchema,
} from "../schemas/designation.schema";

type AdminClient = ReturnType<typeof createAdminClient>;

const norm = (v: string | undefined) => (v && v.length > 0 ? v : null);
const DUPLICATE =
  "A designation with this name already exists in this department.";

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

/** Create a designation. */
export const createDesignation = createAction({
  input: createDesignationSchema,
  permission: PERMISSIONS.DESIGNATION_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const company_id = await getPrimaryCompanyId(admin);

    const { data, error } = await admin
      .from("designations")
      .insert({
        company_id,
        name: input.name,
        department_id: norm(input.department_id),
        grade: norm(input.grade),
        description: norm(input.description),
        status: input.status,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        throw new ActionError(DUPLICATE);
      }
      throw new ActionError(error.message);
    }

    await recordAudit({
      actorId: user.id,
      action: "create",
      entity: "designations",
      entityId: data.id,
      after: { name: input.name, grade: input.grade ?? null },
    });

    revalidatePath(ROUTES.designations);
    return { id: data.id };
  },
});

/** Update a designation. */
export const updateDesignation = createAction({
  input: updateDesignationSchema,
  permission: PERMISSIONS.DESIGNATION_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();

    const { data: before } = await admin
      .from("designations")
      .select("*")
      .eq("id", input.id)
      .is("deleted_at", null)
      .maybeSingle();
    if (!before) throw new ActionError("Designation not found.");

    const update = {
      name: input.name,
      department_id: norm(input.department_id),
      grade: norm(input.grade),
      description: norm(input.description),
      status: input.status,
      updated_by: user.id,
    };

    const { error } = await admin
      .from("designations")
      .update(update)
      .eq("id", input.id);

    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        throw new ActionError(DUPLICATE);
      }
      throw new ActionError(error.message);
    }

    await recordAudit({
      actorId: user.id,
      action: "update",
      entity: "designations",
      entityId: input.id,
      before,
      after: update,
    });

    revalidatePath(ROUTES.designations);
    return { id: input.id };
  },
});

/** Activate / deactivate a designation. */
export const setDesignationStatus = createAction({
  input: setDesignationStatusSchema,
  permission: PERMISSIONS.DESIGNATION_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("designations")
      .update({ status: input.status, updated_by: user.id })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);

    await recordAudit({
      actorId: user.id,
      action: "update",
      entity: "designations",
      entityId: input.id,
      after: { status: input.status },
    });

    revalidatePath(ROUTES.designations);
    return { id: input.id };
  },
});

/** Soft-delete a designation. */
export const deleteDesignation = createAction({
  input: deleteDesignationSchema,
  permission: PERMISSIONS.DESIGNATION_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("designations")
      .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);

    await recordAudit({
      actorId: user.id,
      action: "delete",
      entity: "designations",
      entityId: input.id,
    });

    revalidatePath(ROUTES.designations);
    return { id: input.id };
  },
});
