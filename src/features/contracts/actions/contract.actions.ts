"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/types/common";
import { createAction, ActionError } from "@/server/safe-action";
import { recordAudit } from "@/server/audit";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { STORAGE_BUCKETS } from "@/constants";
import { assertPermission, AuthorizationError } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { ALERT_WINDOWS } from "../constants";
import { getExpiringContracts } from "../queries/contracts.queries";
import {
  contractFormSchema,
  deleteContractSchema,
  reviewContractSchema,
} from "../schemas/contract.schema";

type AdminClient = ReturnType<typeof createAdminClient>;
const norm = (v: string | undefined | null) => (v && v.length > 0 ? v : null);
const DOC_MAX = 15 * 1024 * 1024;

const DOC_FIELDS = [
  { form: "offer_letter", url: "offer_letter_url", name: "offer_letter_name" },
  { form: "contract", url: "contract_url", name: "contract_name" },
  { form: "attachment", url: "attachment_url", name: "attachment_name" },
] as const;

function notifyContract(event: string, contractId: string) {
  logger.info("Contract notification", { event, contractId });
}

async function getPrimaryCompanyId(admin: AdminClient): Promise<string> {
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

function parseForm(formData: FormData) {
  return contractFormSchema.safeParse({
    employee_id: formData.get("employee_id"),
    contract_type: formData.get("contract_type"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date") || undefined,
    notice_period_days: formData.get("notice_period_days") || 30,
    renewal_date: formData.get("renewal_date") || undefined,
    status: formData.get("status") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

async function uploadDoc(
  admin: AdminClient,
  employeeId: string,
  file: File,
): Promise<{ url: string; name: string }> {
  if (file.size > DOC_MAX) {
    throw new ActionError("Each document must be 15 MB or smaller.");
  }
  const safe = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${employeeId}/${Date.now()}-${safe}`;
  const { error } = await admin.storage
    .from(STORAGE_BUCKETS.contractDocuments)
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type || "application/octet-stream",
    });
  if (error) throw new ActionError(error.message);
  return { url: path, name: file.name };
}

async function collectDocPatches(
  admin: AdminClient,
  employeeId: string,
  formData: FormData,
): Promise<Record<string, string>> {
  const patch: Record<string, string> = {};
  for (const field of DOC_FIELDS) {
    const file = formData.get(field.form);
    if (file instanceof File && file.size > 0) {
      const r = await uploadDoc(admin, employeeId, file);
      patch[field.url] = r.url;
      patch[field.name] = r.name;
    }
  }
  return patch;
}

export async function createContractAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await assertPermission(PERMISSIONS.CONTRACT_MANAGE);
    const parsed = parseForm(formData);
    if (!parsed.success) {
      return { success: false, error: "Please check the contract details." };
    }
    const input = parsed.data;
    const admin = createAdminClient();
    const company_id = await getPrimaryCompanyId(admin);
    const docs = await collectDocPatches(admin, input.employee_id, formData);

    const { data, error } = await admin
      .from("contracts")
      .insert({
        company_id,
        employee_id: input.employee_id,
        contract_type: input.contract_type,
        start_date: input.start_date,
        end_date: norm(input.end_date),
        notice_period_days: input.notice_period_days,
        renewal_date: norm(input.renewal_date),
        status: input.status,
        notes: norm(input.notes),
        created_by: user.id,
        ...docs,
      })
      .select("id")
      .single();
    if (error) throw new ActionError(error.message);

    await admin.from("contract_events").insert({
      contract_id: data.id,
      actor_id: user.id,
      action: "created",
    });
    await recordAudit({
      actorId: user.id,
      action: "create",
      entity: "contracts",
      entityId: data.id,
    });
    notifyContract("created", data.id);
    revalidatePath(ROUTES.contracts);
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof ActionError) {
      return { success: false, error: error.message };
    }
    logger.error("Create contract failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: "Failed to create the contract." };
  }
}

export async function updateContractAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await assertPermission(PERMISSIONS.CONTRACT_MANAGE);
    const id = formData.get("id");
    if (typeof id !== "string" || !id) {
      return { success: false, error: "Missing contract id." };
    }
    const parsed = parseForm(formData);
    if (!parsed.success) {
      return { success: false, error: "Please check the contract details." };
    }
    const input = parsed.data;
    const admin = createAdminClient();
    const docs = await collectDocPatches(admin, input.employee_id, formData);

    const { error } = await admin
      .from("contracts")
      .update({
        employee_id: input.employee_id,
        contract_type: input.contract_type,
        start_date: input.start_date,
        end_date: norm(input.end_date),
        notice_period_days: input.notice_period_days,
        renewal_date: norm(input.renewal_date),
        status: input.status,
        notes: norm(input.notes),
        updated_by: user.id,
        ...docs,
      })
      .eq("id", id)
      .is("deleted_at", null);
    if (error) throw new ActionError(error.message);

    await recordAudit({
      actorId: user.id,
      action: "update",
      entity: "contracts",
      entityId: id,
    });
    notifyContract("updated", id);
    revalidatePath(`${ROUTES.contracts}/${id}`);
    revalidatePath(ROUTES.contracts);
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof ActionError) {
      return { success: false, error: error.message };
    }
    logger.error("Update contract failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: "Failed to update the contract." };
  }
}

export const deleteContract = createAction({
  input: deleteContractSchema,
  permission: PERMISSIONS.CONTRACT_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("contracts")
      .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
      .eq("id", input.id)
      .is("deleted_at", null);
    if (error) throw new ActionError(error.message);
    await recordAudit({
      actorId: user.id,
      action: "delete",
      entity: "contracts",
      entityId: input.id,
    });
    revalidatePath(ROUTES.contracts);
    return { ok: true };
  },
});

/** Shared workflow transition: validates status, updates, logs an event + audit. */
async function transition(
  admin: AdminClient,
  actorId: string,
  contractId: string,
  from: string[],
  to: string,
  action: string,
  extra: Record<string, unknown> = {},
  note?: string,
) {
  const { data: row } = await admin
    .from("contracts")
    .select("status")
    .eq("id", contractId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!row) throw new ActionError("Contract not found.");
  if (!from.includes(row.status)) {
    throw new ActionError("This contract can no longer be actioned.");
  }
  const { error } = await admin
    .from("contracts")
    .update({ status: to, updated_by: actorId, ...extra })
    .eq("id", contractId);
  if (error) throw new ActionError(error.message);

  await admin.from("contract_events").insert({
    contract_id: contractId,
    actor_id: actorId,
    action,
    note: note ?? null,
  });
  await recordAudit({
    actorId,
    action: "update",
    entity: "contracts",
    entityId: contractId,
    after: { status: to },
  });
  notifyContract(action, contractId);
  revalidatePath(`${ROUTES.contracts}/${contractId}`);
  revalidatePath(ROUTES.contracts);
}

export const submitContract = createAction({
  input: reviewContractSchema,
  permission: PERMISSIONS.CONTRACT_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    await transition(
      admin,
      user.id,
      input.contract_id,
      ["draft"],
      "pending",
      "submitted",
      { submitted_at: new Date().toISOString() },
      input.note,
    );
    return { ok: true };
  },
});

export const approveContract = createAction({
  input: reviewContractSchema,
  permission: PERMISSIONS.CONTRACT_APPROVE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    await transition(
      admin,
      user.id,
      input.contract_id,
      ["pending"],
      "active",
      "approved",
      { approved_by: user.id, approved_at: new Date().toISOString() },
      input.note,
    );
    return { ok: true };
  },
});

export const rejectContract = createAction({
  input: reviewContractSchema,
  permission: PERMISSIONS.CONTRACT_APPROVE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    await transition(
      admin,
      user.id,
      input.contract_id,
      ["pending"],
      "draft",
      "rejected",
      {},
      input.note,
    );
    return { ok: true };
  },
});

export const terminateContract = createAction({
  input: reviewContractSchema,
  permission: PERMISSIONS.CONTRACT_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    await transition(
      admin,
      user.id,
      input.contract_id,
      ["active"],
      "terminated",
      "terminated",
      {},
      input.note,
    );
    return { ok: true };
  },
});

/** Signed URL to download a contract document (offer letter / contract / attachment). */
export async function getContractDocUrlAction(
  contractId: string,
  kind: "offer_letter" | "contract" | "attachment",
): Promise<ActionResult<{ url: string }>> {
  try {
    await assertPermission(PERMISSIONS.CONTRACT_VIEW);
    const admin = createAdminClient();
    const column = `${kind}_url` as const;
    const { data } = await admin
      .from("contracts")
      .select(column)
      .eq("id", contractId)
      .maybeSingle();
    const path = (data as Record<string, string | null> | null)?.[column];
    if (!path) {
      return { success: false, error: "No document uploaded." };
    }
    const { data: signed, error } = await admin.storage
      .from(STORAGE_BUCKETS.contractDocuments)
      .createSignedUrl(path, 60);
    if (error || !signed) {
      return { success: false, error: "Couldn’t generate a download link." };
    }
    return { success: true, data: { url: signed.signedUrl } };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Download failed." };
  }
}

/**
 * Dispatch reminders for active contracts due within the widest window (90 days)
 * or already expired. Wired to the notification stub; a scheduled edge function
 * can call this daily. Returns how many reminders were queued.
 */
export async function sendContractRemindersAction(): Promise<
  ActionResult<{ count: number }>
> {
  try {
    await assertPermission(PERMISSIONS.CONTRACT_MANAGE);
    const widest = Math.max(...ALERT_WINDOWS);
    const due = await getExpiringContracts(widest);
    for (const contract of due) {
      const days = contract.daysToExpiry ?? 0;
      const bucket = days < 0 ? "expired" : `${days}d`;
      notifyContract(`expiry_reminder:${bucket}`, contract.id);
    }
    return { success: true, data: { count: due.length } };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to send reminders." };
  }
}
