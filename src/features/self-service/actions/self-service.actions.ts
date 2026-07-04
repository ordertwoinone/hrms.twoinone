"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/types/common";
import { ROUTES } from "@/constants/routes";
import { STORAGE_BUCKETS } from "@/constants";
import { requireAuth } from "@/lib/auth/session";
import { AuthorizationError } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/server/audit";
import { logger } from "@/lib/logger";
import { computeLeaveDays } from "@/features/leave/constants";
import { resolveCurrentEmployee } from "../queries/self-service.queries";
import {
  applyLeaveSelfSchema,
  requestLetterSchema,
  updateContactSchema,
} from "../schemas/self-service.schema";

type AdminClient = ReturnType<typeof createAdminClient>;
const norm = (v: string | undefined | null) => (v && v.length > 0 ? v : null);
const DOC_MAX = 10 * 1024 * 1024;

/** Resolve the caller's own employee record or fail. */
async function requireOwnEmployee() {
  const user = await requireAuth();
  const emp = await resolveCurrentEmployee({ id: user.id, email: user.email });
  if (!emp) {
    throw new AuthorizationError("No employee record is linked to your account.");
  }
  return { user, emp };
}

async function getPrimaryCompanyId(admin: AdminClient): Promise<string> {
  const { data } = await admin
    .from("companies")
    .select("id")
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data) throw new AuthorizationError("No company configured.");
  return data.id;
}

export async function updateMyContact(
  input: unknown,
): Promise<ActionResult> {
  try {
    const { user, emp } = await requireOwnEmployee();
    const parsed = updateContactSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Please check the details." };
    }
    const admin = createAdminClient();
    const { error } = await admin
      .from("employees")
      .update({
        phone: norm(parsed.data.phone),
        personal_email: norm(parsed.data.personal_email),
        address_line: norm(parsed.data.address_line),
        city: norm(parsed.data.city),
        country: norm(parsed.data.country),
        updated_by: user.id,
      })
      .eq("id", emp.id);
    if (error) return { success: false, error: error.message };
    await recordAudit({
      actorId: user.id,
      action: "update",
      entity: "employees",
      entityId: emp.id,
    });
    revalidatePath(ROUTES.selfService);
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update your details." };
  }
}

export async function applyMyLeave(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { user, emp } = await requireOwnEmployee();
    const parsed = applyLeaveSelfSchema.safeParse({
      leave_type_id: formData.get("leave_type_id"),
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
      is_half_day: formData.get("is_half_day") === "true",
      half_day_period: formData.get("half_day_period") || undefined,
      reason: formData.get("reason") || undefined,
    });
    if (!parsed.success) {
      return { success: false, error: "Please check the leave details." };
    }
    const input = parsed.data;
    const admin = createAdminClient();
    const company_id = await getPrimaryCompanyId(admin);

    const { data: company } = await admin
      .from("companies")
      .select("working_days")
      .eq("id", company_id)
      .maybeSingle();
    const endDate = input.is_half_day ? input.start_date : input.end_date;
    const { data: hols } = await admin
      .from("company_holidays")
      .select("holiday_date")
      .gte("holiday_date", input.start_date)
      .lte("holiday_date", endDate);
    const holidaySet = new Set((hols ?? []).map((h) => h.holiday_date));
    const totalDays = computeLeaveDays(
      input.start_date,
      endDate,
      company?.working_days ?? [1, 2, 3, 4, 5],
      holidaySet,
      input.is_half_day,
    );
    if (totalDays <= 0) {
      return {
        success: false,
        error: "The selected dates fall on weekends/holidays only.",
      };
    }

    const { data: type } = await admin
      .from("leave_types")
      .select("name, gender_restriction, requires_attachment")
      .eq("id", input.leave_type_id)
      .maybeSingle();
    if (!type) return { success: false, error: "Invalid leave type." };
    if (type.gender_restriction && emp.gender && emp.gender !== type.gender_restriction) {
      return {
        success: false,
        error: `${type.name} is only available to ${type.gender_restriction} employees.`,
      };
    }

    let attachmentPatch: Record<string, unknown> = {};
    const file = formData.get("file");
    if (file instanceof File && file.size > 0) {
      if (file.size > DOC_MAX) {
        return { success: false, error: "Attachment must be 10 MB or smaller." };
      }
      const safe = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `${emp.id}/${Date.now()}-${safe}`;
      const { error: upErr } = await admin.storage
        .from(STORAGE_BUCKETS.leaveAttachments)
        .upload(path, await file.arrayBuffer(), {
          contentType: file.type || "application/octet-stream",
        });
      if (upErr) return { success: false, error: upErr.message };
      attachmentPatch = { attachment_url: path, attachment_name: file.name };
    } else if (type.requires_attachment) {
      return { success: false, error: `${type.name} requires an attachment.` };
    }

    const { data: mgr } = await admin
      .from("employees")
      .select("manager_id")
      .eq("id", emp.id)
      .maybeSingle();

    const { data: req, error } = await admin
      .from("leave_requests")
      .insert({
        company_id,
        employee_id: emp.id,
        leave_type_id: input.leave_type_id,
        start_date: input.start_date,
        end_date: endDate,
        is_half_day: input.is_half_day,
        half_day_period: input.is_half_day
          ? input.half_day_period || "first"
          : null,
        total_days: totalDays,
        reason: norm(input.reason),
        status: "pending",
        manager_id: mgr?.manager_id ?? null,
        created_by: user.id,
        ...attachmentPatch,
      })
      .select("id")
      .single();
    if (error) return { success: false, error: error.message };

    await admin.from("leave_request_events").insert({
      request_id: req.id,
      actor_id: user.id,
      action: "applied",
    });
    revalidatePath(ROUTES.selfService);
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, error: error.message };
    }
    logger.error("ESS apply leave failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: "Failed to submit your leave request." };
  }
}

export async function requestHrLetter(input: unknown): Promise<ActionResult> {
  try {
    const { user, emp } = await requireOwnEmployee();
    const parsed = requestLetterSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Please check the request." };
    }
    const admin = createAdminClient();
    const company_id = await getPrimaryCompanyId(admin);
    const { error } = await admin.from("hr_letter_requests").insert({
      company_id,
      employee_id: emp.id,
      letter_type: parsed.data.letter_type,
      addressed_to: norm(parsed.data.addressed_to),
      purpose: norm(parsed.data.purpose),
      status: "pending",
      created_by: user.id,
    });
    if (error) return { success: false, error: error.message };
    revalidatePath(ROUTES.selfService);
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to submit your request." };
  }
}

export async function markNotificationRead(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const admin = createAdminClient();
    await admin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);
    revalidatePath(ROUTES.selfService);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to update notification." };
  }
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const admin = createAdminClient();
    await admin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
    revalidatePath(ROUTES.selfService);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to update notifications." };
  }
}

/** Signed URL for one of the caller's own documents. */
export async function getMyDocumentUrl(
  documentId: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    const { emp } = await requireOwnEmployee();
    const admin = createAdminClient();
    const { data } = await admin
      .from("employee_documents")
      .select("file_url, employee_id")
      .eq("id", documentId)
      .maybeSingle();
    if (!data || data.employee_id !== emp.id || !data.file_url) {
      return { success: false, error: "Document not found." };
    }
    const { data: signed, error } = await admin.storage
      .from(STORAGE_BUCKETS.employeeDocuments)
      .createSignedUrl(data.file_url, 60);
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

/** Signed URL for the caller's issued HR letter, when ready. */
export async function getMyLetterUrl(
  letterId: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    const { emp } = await requireOwnEmployee();
    const admin = createAdminClient();
    const { data } = await admin
      .from("hr_letter_requests")
      .select("attachment_url, employee_id")
      .eq("id", letterId)
      .maybeSingle();
    if (!data || data.employee_id !== emp.id || !data.attachment_url) {
      return { success: false, error: "Letter not ready." };
    }
    const { data: signed, error } = await admin.storage
      .from(STORAGE_BUCKETS.hrLetters)
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
