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
import { getExpiringPolicies } from "../queries/policies.queries";
import { deletePolicySchema, policyFormSchema } from "../schemas/policy.schema";

type AdminClient = ReturnType<typeof createAdminClient>;
const norm = (v: string | undefined | null) => (v && v.length > 0 ? v : null);
const DOC_MAX = 10 * 1024 * 1024;

/** Email/notification stub. Real delivery plugs in here (Resend/SMTP/edge cron). */
function notifyPolicy(event: string, policyId: string) {
  logger.info("Medical insurance notification", { event, policyId });
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
  return policyFormSchema.safeParse({
    employee_id: formData.get("employee_id"),
    provider: formData.get("provider"),
    policy_number: formData.get("policy_number"),
    coverage: formData.get("coverage"),
    dependents_covered: formData.get("dependents_covered") || 0,
    issue_date: formData.get("issue_date"),
    expiry_date: formData.get("expiry_date"),
    renewal_date: formData.get("renewal_date") || undefined,
    status: formData.get("status") || undefined,
    claims_notes: formData.get("claims_notes") || undefined,
  });
}

async function uploadAttachment(
  admin: AdminClient,
  employeeId: string,
  file: File,
): Promise<{ attachment_url: string; attachment_name: string }> {
  if (file.size > DOC_MAX) {
    throw new ActionError("Attachment must be 10 MB or smaller.");
  }
  const safe = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${employeeId}/${Date.now()}-${safe}`;
  const { error } = await admin.storage
    .from(STORAGE_BUCKETS.medicalInsuranceDocuments)
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type || "application/octet-stream",
    });
  if (error) throw new ActionError(error.message);
  return { attachment_url: path, attachment_name: file.name };
}

function duplicateNumberError(message: string) {
  return /duplicate|unique/i.test(message)
    ? new ActionError("A policy with this number already exists.")
    : new ActionError(message);
}

export async function createPolicyAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await assertPermission(PERMISSIONS.MEDICAL_INSURANCE_MANAGE);
    const parsed = parseForm(formData);
    if (!parsed.success) {
      return { success: false, error: "Please check the policy details." };
    }
    const input = parsed.data;
    const admin = createAdminClient();
    const company_id = await getPrimaryCompanyId(admin);

    let attachment = {};
    const file = formData.get("file");
    if (file instanceof File && file.size > 0) {
      attachment = await uploadAttachment(admin, input.employee_id, file);
    }

    const { data, error } = await admin
      .from("medical_insurance_policies")
      .insert({
        company_id,
        employee_id: input.employee_id,
        provider: input.provider,
        policy_number: input.policy_number,
        coverage: input.coverage,
        dependents_covered: input.dependents_covered,
        issue_date: input.issue_date,
        expiry_date: input.expiry_date,
        renewal_date: norm(input.renewal_date),
        status: input.status,
        claims_notes: norm(input.claims_notes),
        created_by: user.id,
        ...attachment,
      })
      .select("id")
      .single();
    if (error) throw duplicateNumberError(error.message);

    await recordAudit({
      actorId: user.id,
      action: "create",
      entity: "medical_insurance_policies",
      entityId: data.id,
    });
    notifyPolicy("created", data.id);
    revalidatePath(ROUTES.medicalInsurance);
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof ActionError) {
      return { success: false, error: error.message };
    }
    logger.error("Create policy failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: "Failed to create the policy." };
  }
}

export async function updatePolicyAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await assertPermission(PERMISSIONS.MEDICAL_INSURANCE_MANAGE);
    const id = formData.get("id");
    if (typeof id !== "string" || !id) {
      return { success: false, error: "Missing policy record id." };
    }
    const parsed = parseForm(formData);
    if (!parsed.success) {
      return { success: false, error: "Please check the policy details." };
    }
    const input = parsed.data;
    const admin = createAdminClient();

    let attachment = {};
    const file = formData.get("file");
    if (file instanceof File && file.size > 0) {
      attachment = await uploadAttachment(admin, input.employee_id, file);
    }

    const { error } = await admin
      .from("medical_insurance_policies")
      .update({
        employee_id: input.employee_id,
        provider: input.provider,
        policy_number: input.policy_number,
        coverage: input.coverage,
        dependents_covered: input.dependents_covered,
        issue_date: input.issue_date,
        expiry_date: input.expiry_date,
        renewal_date: norm(input.renewal_date),
        status: input.status,
        claims_notes: norm(input.claims_notes),
        updated_by: user.id,
        ...attachment,
      })
      .eq("id", id)
      .is("deleted_at", null);
    if (error) throw duplicateNumberError(error.message);

    await recordAudit({
      actorId: user.id,
      action: "update",
      entity: "medical_insurance_policies",
      entityId: id,
    });
    notifyPolicy("updated", id);
    revalidatePath(ROUTES.medicalInsurance);
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof ActionError) {
      return { success: false, error: error.message };
    }
    logger.error("Update policy failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: "Failed to update the policy." };
  }
}

export const deletePolicy = createAction({
  input: deletePolicySchema,
  permission: PERMISSIONS.MEDICAL_INSURANCE_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("medical_insurance_policies")
      .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
      .eq("id", input.id)
      .is("deleted_at", null);
    if (error) throw new ActionError(error.message);
    await recordAudit({
      actorId: user.id,
      action: "delete",
      entity: "medical_insurance_policies",
      entityId: input.id,
    });
    revalidatePath(ROUTES.medicalInsurance);
    return { ok: true };
  },
});

/** Signed URL to download a policy document. */
export async function getPolicyAttachmentUrlAction(
  policyId: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    await assertPermission(PERMISSIONS.MEDICAL_INSURANCE_VIEW);
    const admin = createAdminClient();
    const { data } = await admin
      .from("medical_insurance_policies")
      .select("attachment_url")
      .eq("id", policyId)
      .maybeSingle();
    if (!data?.attachment_url) {
      return { success: false, error: "No document on this policy." };
    }
    const { data: signed, error } = await admin.storage
      .from(STORAGE_BUCKETS.medicalInsuranceDocuments)
      .createSignedUrl(data.attachment_url, 60);
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
 * Dispatch renewal reminders for policies due within the widest window
 * (90 days) or already expired. Wired to the notification stub; a scheduled
 * edge function can call this daily. Returns how many reminders were queued.
 */
export async function sendPolicyRemindersAction(): Promise<
  ActionResult<{ count: number }>
> {
  try {
    await assertPermission(PERMISSIONS.MEDICAL_INSURANCE_MANAGE);
    const widest = Math.max(...ALERT_WINDOWS);
    const due = await getExpiringPolicies(widest);
    for (const policy of due) {
      const bucket =
        policy.daysToExpiry < 0 ? "expired" : `${policy.daysToExpiry}d`;
      notifyPolicy(`expiry_reminder:${bucket}`, policy.id);
    }
    return { success: true, data: { count: due.length } };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to send reminders." };
  }
}
