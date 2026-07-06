"use server";

import { revalidatePath } from "next/cache";

import { createAction, ActionError } from "@/server/safe-action";
import { recordAudit } from "@/server/audit";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  bankAccountFormSchema,
  updateBankAccountSchema,
  deleteBankAccountSchema,
} from "../schemas/payroll.schema";

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

export const createBankAccount = createAction({
  input: bankAccountFormSchema,
  permission: PERMISSIONS.SALARY_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const company_id = await getPrimaryCompanyId();

    if (input.is_primary) {
      await admin
        .from("bank_accounts")
        .update({ is_primary: false, updated_by: user.id })
        .eq("employee_id", input.employee_id)
        .is("deleted_at", null);
    }

    const { data, error } = await admin.from("bank_accounts").insert({
      company_id,
      employee_id: input.employee_id,
      bank_name: input.bank_name,
      account_number: input.account_number,
      iban: input.iban.toUpperCase(),
      account_holder_name: input.account_holder_name,
      currency: input.currency,
      is_primary: input.is_primary,
      notes: input.notes ?? null,
      created_by: user.id,
    }).select("id").single();
    if (error) throw new ActionError(error.message);
    await recordAudit({
      actorId: user.id,
      action: "create",
      entity: "bank_accounts",
      entityId: data.id,
    });
    revalidatePath(ROUTES.payrollSalaryStructures);
    return { id: data.id };
  },
});

export const updateBankAccount = createAction({
  input: updateBankAccountSchema,
  permission: PERMISSIONS.SALARY_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();

    if (input.is_primary) {
      await admin
        .from("bank_accounts")
        .update({ is_primary: false, updated_by: user.id })
        .eq("employee_id", input.employee_id)
        .neq("id", input.id)
        .is("deleted_at", null);
    }

    const { error } = await admin
      .from("bank_accounts")
      .update({
        bank_name: input.bank_name,
        account_number: input.account_number,
        iban: input.iban.toUpperCase(),
        account_holder_name: input.account_holder_name,
        currency: input.currency,
        is_primary: input.is_primary,
        notes: input.notes ?? null,
        updated_by: user.id,
      })
      .eq("id", input.id)
      .is("deleted_at", null);
    if (error) throw new ActionError(error.message);
    revalidatePath(ROUTES.payrollSalaryStructures);
    return { ok: true };
  },
});

export const deleteBankAccount = createAction({
  input: deleteBankAccountSchema,
  permission: PERMISSIONS.SALARY_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("bank_accounts")
      .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
      .eq("id", input.id)
      .is("deleted_at", null);
    if (error) throw new ActionError(error.message);
    revalidatePath(ROUTES.payrollSalaryStructures);
    return { ok: true };
  },
});
