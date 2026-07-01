"use server";

import { revalidatePath } from "next/cache";

import { createAction, ActionError } from "@/server/safe-action";
import { recordAudit } from "@/server/audit";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createBranchSchema,
  deleteBranchSchema,
  setBranchStatusSchema,
  updateBranchSchema,
} from "../schemas/branch.schema";

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

/** Create a branch under the (single) company. */
export const createBranch = createAction({
  input: createBranchSchema,
  permission: PERMISSIONS.BRANCH_CREATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const company_id = await getPrimaryCompanyId(admin);

    const { data, error } = await admin
      .from("branches")
      .insert({
        company_id,
        name: input.name,
        code: input.code.toUpperCase(),
        address_line: norm(input.address_line),
        city: norm(input.city),
        country: input.country,
        phone: norm(input.phone),
        email: norm(input.email),
        manager_id: norm(input.manager_id),
        status: input.status,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        throw new ActionError("A branch with this code already exists.");
      }
      throw new ActionError(error.message);
    }

    await recordAudit({
      actorId: user.id,
      action: "create",
      entity: "branches",
      entityId: data.id,
      after: { name: input.name, code: input.code.toUpperCase() },
    });

    revalidatePath(ROUTES.branches);
    return { id: data.id };
  },
});

/** Update a branch. */
export const updateBranch = createAction({
  input: updateBranchSchema,
  permission: PERMISSIONS.BRANCH_UPDATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();

    const { data: before } = await admin
      .from("branches")
      .select("*")
      .eq("id", input.id)
      .is("deleted_at", null)
      .maybeSingle();
    if (!before) throw new ActionError("Branch not found.");

    const update = {
      name: input.name,
      code: input.code.toUpperCase(),
      address_line: norm(input.address_line),
      city: norm(input.city),
      country: input.country,
      phone: norm(input.phone),
      email: norm(input.email),
      manager_id: norm(input.manager_id),
      status: input.status,
      updated_by: user.id,
    };

    const { error } = await admin
      .from("branches")
      .update(update)
      .eq("id", input.id);

    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        throw new ActionError("A branch with this code already exists.");
      }
      throw new ActionError(error.message);
    }

    await recordAudit({
      actorId: user.id,
      action: "update",
      entity: "branches",
      entityId: input.id,
      before,
      after: update,
    });

    revalidatePath(ROUTES.branches);
    return { id: input.id };
  },
});

/** Activate / deactivate a branch. */
export const setBranchStatus = createAction({
  input: setBranchStatusSchema,
  permission: PERMISSIONS.BRANCH_UPDATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("branches")
      .update({ status: input.status, updated_by: user.id })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);

    await recordAudit({
      actorId: user.id,
      action: "update",
      entity: "branches",
      entityId: input.id,
      after: { status: input.status },
    });

    revalidatePath(ROUTES.branches);
    return { id: input.id };
  },
});

/** Soft-delete a branch (sets `deleted_at`). */
export const deleteBranch = createAction({
  input: deleteBranchSchema,
  permission: PERMISSIONS.BRANCH_DELETE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("branches")
      .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);

    await recordAudit({
      actorId: user.id,
      action: "delete",
      entity: "branches",
      entityId: input.id,
    });

    revalidatePath(ROUTES.branches);
    return { id: input.id };
  },
});
