"use server";

import { revalidatePath } from "next/cache";

import { createAction, ActionError } from "@/server/safe-action";
import { recordAudit } from "@/server/audit";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createEmploymentTypeSchema,
  deleteEmploymentTypeSchema,
  setEmploymentTypeStatusSchema,
  updateEmploymentTypeSchema,
} from "../schemas/employment-type.schema";

type AdminClient = ReturnType<typeof createAdminClient>;

const norm = (v: string | undefined) => (v && v.length > 0 ? v : null);
const DUPLICATE = "An employment type with this name already exists.";

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

/** Create a custom employment type. */
export const createEmploymentType = createAction({
  input: createEmploymentTypeSchema,
  permission: PERMISSIONS.EMPLOYMENT_TYPE_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const company_id = await getPrimaryCompanyId(admin);

    const { data, error } = await admin
      .from("employment_types")
      .insert({
        company_id,
        name: input.name,
        description: norm(input.description),
        status: input.status,
        is_system: false,
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
      entity: "employment_types",
      entityId: data.id,
      after: { name: input.name },
    });

    revalidatePath(ROUTES.employmentTypes);
    return { id: data.id };
  },
});

/** Update an employment type (system defaults are editable but not deletable). */
export const updateEmploymentType = createAction({
  input: updateEmploymentTypeSchema,
  permission: PERMISSIONS.EMPLOYMENT_TYPE_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();

    const { data: before } = await admin
      .from("employment_types")
      .select("*")
      .eq("id", input.id)
      .is("deleted_at", null)
      .maybeSingle();
    if (!before) throw new ActionError("Employment type not found.");

    const update = {
      name: input.name,
      description: norm(input.description),
      status: input.status,
      updated_by: user.id,
    };

    const { error } = await admin
      .from("employment_types")
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
      entity: "employment_types",
      entityId: input.id,
      before,
      after: update,
    });

    revalidatePath(ROUTES.employmentTypes);
    return { id: input.id };
  },
});

/** Activate / deactivate an employment type. */
export const setEmploymentTypeStatus = createAction({
  input: setEmploymentTypeStatusSchema,
  permission: PERMISSIONS.EMPLOYMENT_TYPE_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("employment_types")
      .update({ status: input.status, updated_by: user.id })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);

    await recordAudit({
      actorId: user.id,
      action: "update",
      entity: "employment_types",
      entityId: input.id,
      after: { status: input.status },
    });

    revalidatePath(ROUTES.employmentTypes);
    return { id: input.id };
  },
});

/** Soft-delete a custom employment type. System defaults cannot be deleted. */
export const deleteEmploymentType = createAction({
  input: deleteEmploymentTypeSchema,
  permission: PERMISSIONS.EMPLOYMENT_TYPE_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();

    const { data: existing } = await admin
      .from("employment_types")
      .select("is_system")
      .eq("id", input.id)
      .is("deleted_at", null)
      .maybeSingle();
    if (!existing) throw new ActionError("Employment type not found.");
    if (existing.is_system) {
      throw new ActionError("System employment types can’t be deleted.");
    }

    const { error } = await admin
      .from("employment_types")
      .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);

    await recordAudit({
      actorId: user.id,
      action: "delete",
      entity: "employment_types",
      entityId: input.id,
    });

    revalidatePath(ROUTES.employmentTypes);
    return { id: input.id };
  },
});
