"use server";

import { revalidatePath } from "next/cache";

import { createAction, ActionError } from "@/server/safe-action";
import { recordAudit } from "@/server/audit";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { createAdminClient } from "@/lib/supabase/admin";
import { bonusFormSchema, bonusIdSchema } from "../schemas/payroll.schema";

async function getPrimaryCompanyId(): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("companies")
    .select("id")
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data) throw new ActionError("No company is configured yet.");
  return data.id;
}

export const createBonus = createAction({
  input: bonusFormSchema,
  permission: PERMISSIONS.BONUS_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const company_id = await getPrimaryCompanyId();
    const { data, error } = await admin.from("bonuses").insert({
      company_id,
      employee_id: input.employee_id,
      bonus_type: input.bonus_type,
      amount: input.amount,
      effective_month: input.effective_month,
      effective_year: input.effective_year,
      description: input.description ?? null,
      notes: input.notes ?? null,
      status: "pending",
      created_by: user.id,
    }).select("id").single();
    if (error) throw new ActionError(error.message);
    await recordAudit({
      actorId: user.id,
      action: "create",
      entity: "bonuses",
      entityId: data.id,
    });
    revalidatePath(ROUTES.payrollBonuses);
    return { id: data.id };
  },
});

export const approveBonus = createAction({
  input: bonusIdSchema,
  permission: PERMISSIONS.BONUS_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("bonuses")
      .select("status")
      .eq("id", input.id)
      .maybeSingle();
    if (!existing) throw new ActionError("Bonus not found.");
    if (existing.status !== "pending") {
      throw new ActionError("Only pending bonuses can be approved.");
    }
    const { error } = await admin
      .from("bonuses")
      .update({
        status: "approved",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        notes: input.remarks ?? null,
        updated_by: user.id,
      })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);
    await recordAudit({
      actorId: user.id,
      action: "approve",
      entity: "bonuses",
      entityId: input.id,
    });
    revalidatePath(ROUTES.payrollBonuses);
    return { ok: true };
  },
});

export const cancelBonus = createAction({
  input: bonusIdSchema,
  permission: PERMISSIONS.BONUS_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("bonuses")
      .update({
        status: "cancelled",
        deleted_at: new Date().toISOString(),
        notes: input.remarks ?? null,
        updated_by: user.id,
      })
      .eq("id", input.id)
      .in("status", ["pending", "approved"]);
    if (error) throw new ActionError(error.message);
    revalidatePath(ROUTES.payrollBonuses);
    return { ok: true };
  },
});
