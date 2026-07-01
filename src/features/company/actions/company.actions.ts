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
import {
  addHolidaySchema,
  deleteHolidaySchema,
  updateCompanySchema,
} from "../schemas/company.schema";
import { LOGO_ACCEPTED_TYPES, LOGO_MAX_BYTES } from "../constants";

const emptyToNull = (v: string | undefined) => (v && v.length > 0 ? v : null);

/** Update the company profile. Super Admin only (`company:manage`). */
export const updateCompany = createAction({
  input: updateCompanySchema,
  permission: PERMISSIONS.COMPANY_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { id } = input;

    const update = {
      name: input.name,
      trade_license_number: emptyToNull(input.trade_license_number),
      tax_registration_number: emptyToNull(input.tax_registration_number),
      email: emptyToNull(input.email),
      phone: emptyToNull(input.phone),
      website: emptyToNull(input.website),
      address_line: emptyToNull(input.address_line),
      city: emptyToNull(input.city),
      country: input.country,
      timezone: input.timezone,
      currency: input.currency,
      working_days: input.working_days,
      office_start_time: emptyToNull(input.office_start_time),
      office_end_time: emptyToNull(input.office_end_time),
      updated_by: user.id,
    };

    const { data: before } = await admin
      .from("companies")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    const { error } = await admin.from("companies").update(update).eq("id", id);
    if (error) throw new ActionError(error.message);

    await recordAudit({
      actorId: user.id,
      action: "update",
      entity: "companies",
      entityId: id,
      before,
      after: update,
    });

    revalidatePath(ROUTES.company);
    return { id };
  },
});

/** Add a public holiday. */
export const addHoliday = createAction({
  input: addHolidaySchema,
  permission: PERMISSIONS.COMPANY_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin.from("company_holidays").insert({
      company_id: input.company_id,
      name: input.name,
      holiday_date: input.holiday_date,
      is_recurring: input.is_recurring,
      created_by: user.id,
    });

    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        throw new ActionError("A holiday already exists on that date.");
      }
      throw new ActionError(error.message);
    }

    await recordAudit({
      actorId: user.id,
      action: "create",
      entity: "company_holidays",
      entityId: input.company_id,
      after: { name: input.name, date: input.holiday_date },
    });

    revalidatePath(ROUTES.company);
    return { ok: true };
  },
});

/** Remove a public holiday. */
export const deleteHoliday = createAction({
  input: deleteHolidaySchema,
  permission: PERMISSIONS.COMPANY_MANAGE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("company_holidays")
      .delete()
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);

    await recordAudit({
      actorId: user.id,
      action: "delete",
      entity: "company_holidays",
      entityId: input.id,
    });

    revalidatePath(ROUTES.company);
    return { ok: true };
  },
});

/**
 * Upload a company logo. Privileged file handling runs on the server only:
 * validates the type/size, uploads to Supabase Storage via the service-role
 * admin client, and saves the public URL on the company.
 */
export async function uploadCompanyLogoAction(
  formData: FormData,
): Promise<ActionResult<{ logoUrl: string }>> {
  try {
    const user = await assertPermission(PERMISSIONS.COMPANY_MANAGE);

    const companyId = formData.get("companyId");
    const file = formData.get("file");

    if (typeof companyId !== "string" || !(file instanceof File)) {
      return { success: false, error: "Invalid upload request." };
    }
    if (!LOGO_ACCEPTED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Logo must be a PNG, JPG, WEBP, or SVG.",
      };
    }
    if (file.size > LOGO_MAX_BYTES) {
      return { success: false, error: "Logo must be 2 MB or smaller." };
    }

    const admin = createAdminClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${companyId}/logo-${Date.now()}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await admin.storage
      .from(STORAGE_BUCKETS.company)
      .upload(path, bytes, { contentType: file.type, upsert: true });
    if (uploadError) return { success: false, error: uploadError.message };

    const {
      data: { publicUrl },
    } = admin.storage.from(STORAGE_BUCKETS.company).getPublicUrl(path);

    const { error: updateError } = await admin
      .from("companies")
      .update({ logo_url: publicUrl, updated_by: user.id })
      .eq("id", companyId);
    if (updateError) return { success: false, error: updateError.message };

    await recordAudit({
      actorId: user.id,
      action: "update",
      entity: "companies",
      entityId: companyId,
      metadata: { event: "logo_updated" },
    });

    revalidatePath(ROUTES.company);
    return { success: true, data: { logoUrl: publicUrl } };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, error: error.message };
    }
    logger.error("Company logo upload failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: "Failed to upload logo. Please try again.",
    };
  }
}
