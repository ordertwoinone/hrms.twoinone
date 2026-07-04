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
import { notifyUsers } from "@/features/notifications/server/notify";
import { computeLeaveDays } from "../constants";
import type { LeaveBalanceItem, LeaveCalendarEntry } from "../types";
import { getLeaveBalances, getLeaveCalendar } from "../queries/leave.queries";
import {
  allocateBalanceSchema,
  applyLeaveSchema,
  cancelLeaveSchema,
  deleteLeaveTypeSchema,
  leaveTypeFormSchema,
  reviewLeaveSchema,
  updateLeaveTypeSchema,
} from "../schemas/leave.schema";

type AdminClient = ReturnType<typeof createAdminClient>;
const norm = (v: string | undefined) => (v && v.length > 0 ? v : null);
const DOC_MAX = 10 * 1024 * 1024;

/**
 * Email notification stub. Real delivery (Supabase/Resend/SMTP) plugs in here;
 * for now the intent is logged so the workflow is observable end-to-end.
 */
function notifyLeave(event: string, requestId: string) {
  logger.info("Leave notification", { event, requestId });
}

/** Shared workflow transition: validates the current status, updates, records an event + audit. */
async function transition(
  admin: AdminClient,
  actorId: string,
  requestId: string,
  from: string[],
  to: string,
  eventAction: string,
  note?: string,
) {
  const { data: req } = await admin
    .from("leave_requests")
    .select("status, employee_id")
    .eq("id", requestId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!req) throw new ActionError("Leave request not found.");
  if (!from.includes(req.status)) {
    throw new ActionError("This request can no longer be actioned.");
  }

  const { error } = await admin
    .from("leave_requests")
    .update({ status: to, updated_by: actorId })
    .eq("id", requestId);
  if (error) throw new ActionError(error.message);

  await admin.from("leave_request_events").insert({
    request_id: requestId,
    actor_id: actorId,
    action: eventAction,
    note: note ?? null,
  });
  await recordAudit({
    actorId,
    action: "update",
    entity: "leave_requests",
    entityId: requestId,
    after: { status: to },
  });
  notifyLeave(eventAction, requestId);
  revalidatePath(`${ROUTES.leave}/${requestId}`);
  revalidatePath(ROUTES.leave);
}

/** Apply for leave (multipart: metadata + optional attachment). */
export async function applyLeaveAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await assertPermission([
      PERMISSIONS.LEAVE_REQUEST,
      PERMISSIONS.LEAVE_MANAGE,
    ]);

    const parsed = applyLeaveSchema.safeParse({
      employee_id: formData.get("employee_id"),
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

    const { data: company } = await admin
      .from("companies")
      .select("id, working_days")
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!company) return { success: false, error: "No company configured." };

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
      company.working_days,
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

    const { data: emp } = await admin
      .from("employees")
      .select("gender, manager_id")
      .eq("id", input.employee_id)
      .is("deleted_at", null)
      .maybeSingle();
    if (!emp) return { success: false, error: "Invalid employee." };
    if (
      type.gender_restriction &&
      emp.gender &&
      emp.gender !== type.gender_restriction
    ) {
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
      const path = `${input.employee_id}/${Date.now()}-${safe}`;
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

    const { data: req, error } = await admin
      .from("leave_requests")
      .insert({
        company_id: company.id,
        employee_id: input.employee_id,
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
        manager_id: emp.manager_id,
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
    await recordAudit({
      actorId: user.id,
      action: "create",
      entity: "leave_requests",
      entityId: req.id,
    });
    notifyLeave("applied", req.id);
    revalidatePath(ROUTES.leave);
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, error: error.message };
    }
    logger.error("Apply leave failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: "Failed to submit the leave request." };
  }
}

/** Manager approval (stage 1). */
export const managerApproveLeave = createAction({
  input: reviewLeaveSchema,
  permission: PERMISSIONS.LEAVE_APPROVE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    await transition(
      admin,
      user.id,
      input.request_id,
      ["pending"],
      "manager_approved",
      "manager_approved",
      input.note,
    );
    return { ok: true };
  },
});

export const rejectLeave = createAction({
  input: reviewLeaveSchema,
  permission: PERMISSIONS.LEAVE_APPROVE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    await transition(
      admin,
      user.id,
      input.request_id,
      ["pending", "manager_approved"],
      "rejected",
      "rejected",
      input.note,
    );
    await notifyLeaveOutcome(admin, input.request_id, false);
    return { ok: true };
  },
});

/** Notify the requesting employee (if they have a portal account) of an outcome. */
async function notifyLeaveOutcome(
  admin: AdminClient,
  requestId: string,
  approved: boolean,
) {
  const { data: req } = await admin
    .from("leave_requests")
    .select("employee_id, start_date, end_date")
    .eq("id", requestId)
    .maybeSingle();
  if (!req) return;
  const { data: emp } = await admin
    .from("employees")
    .select("user_id")
    .eq("id", req.employee_id)
    .maybeSingle();
  if (!emp?.user_id) return;
  await notifyUsers([emp.user_id], {
    category: "leave",
    type: approved ? "success" : "destructive",
    title: approved ? "Leave approved" : "Leave request rejected",
    body: `Your leave from ${req.start_date} to ${req.end_date} was ${
      approved ? "approved" : "rejected"
    }.`,
    link: ROUTES.selfService,
  });
}

/** HR final approval (stage 2). */
export const hrApproveLeave = createAction({
  input: reviewLeaveSchema,
  permission: PERMISSIONS.LEAVE_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    await transition(
      admin,
      user.id,
      input.request_id,
      ["manager_approved", "pending"],
      "approved",
      "hr_approved",
      input.note,
    );
    await notifyLeaveOutcome(admin, input.request_id, true);
    return { ok: true };
  },
});

export const cancelLeave = createAction({
  input: cancelLeaveSchema,
  permission: [PERMISSIONS.LEAVE_REQUEST, PERMISSIONS.LEAVE_MANAGE],
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    await transition(
      admin,
      user.id,
      input.id,
      ["pending", "manager_approved", "approved"],
      "cancelled",
      "cancelled",
    );
    return { ok: true };
  },
});

/** Signed URL to download a leave attachment. */
export async function getLeaveAttachmentUrlAction(
  requestId: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    await assertPermission(PERMISSIONS.LEAVE_VIEW);
    const admin = createAdminClient();
    const { data } = await admin
      .from("leave_requests")
      .select("attachment_url")
      .eq("id", requestId)
      .maybeSingle();
    if (!data?.attachment_url) {
      return { success: false, error: "No attachment on this request." };
    }
    const { data: signed, error } = await admin.storage
      .from(STORAGE_BUCKETS.leaveAttachments)
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

// ── Leave types (config) ──
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

export const createLeaveType = createAction({
  input: leaveTypeFormSchema,
  permission: PERMISSIONS.LEAVE_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const company_id = await getPrimaryCompanyId(admin);
    const { error } = await admin.from("leave_types").insert({
      company_id,
      name: input.name,
      code: input.code.toUpperCase(),
      description: norm(input.description),
      days_per_year: input.days_per_year,
      is_paid: input.is_paid,
      requires_attachment: input.requires_attachment,
      gender_restriction: norm(input.gender_restriction),
      color: input.color,
      status: input.status,
      is_system: false,
      created_by: user.id,
    });
    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        throw new ActionError("A leave type with this name already exists.");
      }
      throw new ActionError(error.message);
    }
    revalidatePath(ROUTES.leave);
    return { ok: true };
  },
});

export const updateLeaveType = createAction({
  input: updateLeaveTypeSchema,
  permission: PERMISSIONS.LEAVE_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("leave_types")
      .update({
        name: input.name,
        code: input.code.toUpperCase(),
        description: norm(input.description),
        days_per_year: input.days_per_year,
        is_paid: input.is_paid,
        requires_attachment: input.requires_attachment,
        gender_restriction: norm(input.gender_restriction),
        color: input.color,
        status: input.status,
        updated_by: user.id,
      })
      .eq("id", input.id);
    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        throw new ActionError("A leave type with this name already exists.");
      }
      throw new ActionError(error.message);
    }
    revalidatePath(ROUTES.leave);
    return { ok: true };
  },
});

export const deleteLeaveType = createAction({
  input: deleteLeaveTypeSchema,
  permission: PERMISSIONS.LEAVE_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("leave_types")
      .select("is_system")
      .eq("id", input.id)
      .is("deleted_at", null)
      .maybeSingle();
    if (!existing) throw new ActionError("Leave type not found.");
    if (existing.is_system) {
      throw new ActionError("System leave types can’t be deleted.");
    }
    const { error } = await admin
      .from("leave_types")
      .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);
    revalidatePath(ROUTES.leave);
    return { ok: true };
  },
});

/** Allocate / update a leave balance for an employee and year. */
export const allocateBalance = createAction({
  input: allocateBalanceSchema,
  permission: PERMISSIONS.LEAVE_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const company_id = await getPrimaryCompanyId(admin);
    const { error } = await admin.from("leave_balances").upsert(
      {
        company_id,
        employee_id: input.employee_id,
        leave_type_id: input.leave_type_id,
        year: input.year,
        allocated: input.allocated,
        carried_forward: input.carried_forward,
        updated_by: user.id,
        created_by: user.id,
      },
      { onConflict: "employee_id,leave_type_id,year" },
    );
    if (error) throw new ActionError(error.message);
    revalidatePath(ROUTES.leave);
    return { ok: true };
  },
});

// ── Interactive reads (client selectors) ──
export async function fetchLeaveBalancesAction(
  employeeId: string,
  year: number,
): Promise<ActionResult<LeaveBalanceItem[]>> {
  try {
    await assertPermission(PERMISSIONS.LEAVE_VIEW);
    const data = await getLeaveBalances(employeeId, year);
    return { success: true, data };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Couldn’t load balances." };
  }
}

export async function fetchLeaveCalendarAction(
  year: number,
  month: number,
): Promise<
  ActionResult<{
    leaves: LeaveCalendarEntry[];
    holidays: { date: string; name: string }[];
  }>
> {
  try {
    await assertPermission(PERMISSIONS.LEAVE_VIEW);
    const data = await getLeaveCalendar(year, month);
    return { success: true, data };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Couldn’t load the calendar." };
  }
}
