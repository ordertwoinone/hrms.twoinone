"use server";

import { revalidatePath } from "next/cache";

import { createAction, ActionError } from "@/server/safe-action";
import { recordAudit } from "@/server/audit";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { createAdminClient } from "@/lib/supabase/admin";
import { round2 } from "../constants";
import {
  advanceFormSchema,
  updateAdvanceSchema,
  advanceIdSchema,
} from "../schemas/payroll.schema";

const num = (v: unknown) => Number(v ?? 0);

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

export const createAdvance = createAction({
  input: advanceFormSchema,
  permission: PERMISSIONS.ADVANCE_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const company_id = await getPrimaryCompanyId();
    const monthly_deduction = round2(input.amount / input.repayment_months);
    const { data, error } = await admin.from("salary_advances").insert({
      company_id,
      employee_id: input.employee_id,
      amount: input.amount,
      advance_date: input.advance_date,
      repayment_months: input.repayment_months,
      monthly_deduction,
      outstanding: input.amount,
      reason: input.reason ?? null,
      status: "pending",
      notes: input.notes ?? null,
      created_by: user.id,
    }).select("id").single();
    if (error) throw new ActionError(error.message);
    await recordAudit({
      actorId: user.id,
      action: "create",
      entity: "salary_advances",
      entityId: data.id,
    });
    revalidatePath(ROUTES.payrollAdvances);
    return { id: data.id };
  },
});

export const updateAdvance = createAction({
  input: updateAdvanceSchema,
  permission: PERMISSIONS.ADVANCE_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("salary_advances")
      .select("status")
      .eq("id", input.id)
      .maybeSingle();
    if (!existing) throw new ActionError("Advance not found.");
    if (!["pending"].includes(existing.status)) {
      throw new ActionError("Only pending advances can be edited.");
    }
    const monthly_deduction = round2(input.amount / input.repayment_months);
    const { error } = await admin
      .from("salary_advances")
      .update({
        employee_id: input.employee_id,
        amount: input.amount,
        advance_date: input.advance_date,
        repayment_months: input.repayment_months,
        monthly_deduction,
        outstanding: input.amount,
        reason: input.reason ?? null,
        notes: input.notes ?? null,
        updated_by: user.id,
      })
      .eq("id", input.id)
      .is("deleted_at", null);
    if (error) throw new ActionError(error.message);
    revalidatePath(ROUTES.payrollAdvances);
    return { ok: true };
  },
});

export const approveAdvance = createAction({
  input: advanceIdSchema,
  permission: PERMISSIONS.ADVANCE_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("salary_advances")
      .select("status")
      .eq("id", input.id)
      .maybeSingle();
    if (!existing) throw new ActionError("Advance not found.");
    if (existing.status !== "pending") {
      throw new ActionError("Only pending advances can be approved.");
    }
    const { error } = await admin
      .from("salary_advances")
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
      entity: "salary_advances",
      entityId: input.id,
    });
    revalidatePath(ROUTES.payrollAdvances);
    return { ok: true };
  },
});

export const activateAdvance = createAction({
  input: advanceIdSchema,
  permission: PERMISSIONS.ADVANCE_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("salary_advances")
      .select("status, amount, monthly_deduction")
      .eq("id", input.id)
      .maybeSingle();
    if (!existing) throw new ActionError("Advance not found.");
    if (existing.status !== "approved") {
      throw new ActionError("Only approved advances can be activated.");
    }
    const { error } = await admin
      .from("salary_advances")
      .update({
        status: "active",
        outstanding: num(existing.amount),
        updated_by: user.id,
      })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);
    revalidatePath(ROUTES.payrollAdvances);
    return { ok: true };
  },
});

export const rejectAdvance = createAction({
  input: advanceIdSchema,
  permission: PERMISSIONS.ADVANCE_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("salary_advances")
      .update({
        status: "rejected",
        notes: input.remarks ?? null,
        updated_by: user.id,
      })
      .eq("id", input.id)
      .in("status", ["pending", "approved"]);
    if (error) throw new ActionError(error.message);
    await recordAudit({
      actorId: user.id,
      action: "reject",
      entity: "salary_advances",
      entityId: input.id,
    });
    revalidatePath(ROUTES.payrollAdvances);
    return { ok: true };
  },
});

export const cancelAdvance = createAction({
  input: advanceIdSchema,
  permission: PERMISSIONS.ADVANCE_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("salary_advances")
      .update({
        status: "cancelled",
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq("id", input.id)
      .in("status", ["pending", "approved"]);
    if (error) throw new ActionError(error.message);
    revalidatePath(ROUTES.payrollAdvances);
    return { ok: true };
  },
});
