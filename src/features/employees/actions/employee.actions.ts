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
  createEmployeeSchema,
  deleteEmployeeSchema,
  setEmployeeStatusSchema,
  updateEmployeeSchema,
  type EmployeeFormInput,
} from "../schemas/employee.schema";
import { PHOTO_ACCEPTED_TYPES, PHOTO_MAX_BYTES } from "../constants";

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

function toRecord(input: EmployeeFormInput) {
  return {
    employee_code: input.employee_code,
    first_name: input.first_name,
    last_name: input.last_name,
    work_email: norm(input.work_email),
    personal_email: norm(input.personal_email),
    phone: norm(input.phone),
    gender: norm(input.gender),
    date_of_birth: norm(input.date_of_birth),
    marital_status: norm(input.marital_status),
    nationality: norm(input.nationality),
    department_id: norm(input.department_id),
    designation_id: norm(input.designation_id),
    branch_id: norm(input.branch_id),
    employment_type_id: norm(input.employment_type_id),
    manager_id: norm(input.manager_id),
    date_of_joining: norm(input.date_of_joining),
    date_of_leaving: norm(input.date_of_leaving),
    work_location: norm(input.work_location),
    address_line: norm(input.address_line),
    city: norm(input.city),
    country: norm(input.country),
    status: input.status,
  };
}

/** Create an employee. */
export const createEmployee = createAction({
  input: createEmployeeSchema,
  permission: PERMISSIONS.EMPLOYEE_CREATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const company_id = await getPrimaryCompanyId(admin);

    const { data, error } = await admin
      .from("employees")
      .insert({ company_id, ...toRecord(input), created_by: user.id })
      .select("id")
      .single();

    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        throw new ActionError("An employee with this code already exists.");
      }
      throw new ActionError(error.message);
    }

    await recordAudit({
      actorId: user.id,
      action: "create",
      entity: "employees",
      entityId: data.id,
      after: {
        code: input.employee_code,
        name: `${input.first_name} ${input.last_name}`,
      },
    });

    revalidatePath(ROUTES.employees);
    return { id: data.id };
  },
});

/** Update an employee. */
export const updateEmployee = createAction({
  input: updateEmployeeSchema,
  permission: PERMISSIONS.EMPLOYEE_UPDATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();

    const { data: before } = await admin
      .from("employees")
      .select("*")
      .eq("id", input.id)
      .is("deleted_at", null)
      .maybeSingle();
    if (!before) throw new ActionError("Employee not found.");

    const { error } = await admin
      .from("employees")
      .update({ ...toRecord(input), updated_by: user.id })
      .eq("id", input.id);

    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        throw new ActionError("An employee with this code already exists.");
      }
      throw new ActionError(error.message);
    }

    await recordAudit({
      actorId: user.id,
      action: "update",
      entity: "employees",
      entityId: input.id,
      metadata: { section: "profile" },
    });

    revalidatePath(`${ROUTES.employees}/${input.id}`);
    revalidatePath(ROUTES.employees);
    return { id: input.id };
  },
});

/** Change an employee's status. */
export const setEmployeeStatus = createAction({
  input: setEmployeeStatusSchema,
  permission: PERMISSIONS.EMPLOYEE_UPDATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("employees")
      .update({ status: input.status, updated_by: user.id })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);

    await recordAudit({
      actorId: user.id,
      action: "update",
      entity: "employees",
      entityId: input.id,
      after: { status: input.status },
      metadata: { section: "status" },
    });

    revalidatePath(`${ROUTES.employees}/${input.id}`);
    revalidatePath(ROUTES.employees);
    return { id: input.id };
  },
});

/** Soft-delete an employee. */
export const deleteEmployee = createAction({
  input: deleteEmployeeSchema,
  permission: PERMISSIONS.EMPLOYEE_DELETE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("employees")
      .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);

    await recordAudit({
      actorId: user.id,
      action: "delete",
      entity: "employees",
      entityId: input.id,
    });

    revalidatePath(ROUTES.employees);
    return { id: input.id };
  },
});

/** Upload a photo (`kind="photo"`) or signature (`kind="signature"`). */
async function uploadImage(
  formData: FormData,
  kind: "photo" | "signature",
): Promise<ActionResult<{ url: string }>> {
  try {
    const user = await assertPermission(PERMISSIONS.EMPLOYEE_UPDATE);
    const employeeId = formData.get("employeeId");
    const file = formData.get("file");

    if (typeof employeeId !== "string" || !(file instanceof File)) {
      return { success: false, error: "Invalid upload request." };
    }
    if (!PHOTO_ACCEPTED_TYPES.includes(file.type)) {
      return { success: false, error: "Image must be a PNG, JPG, or WEBP." };
    }
    if (file.size > PHOTO_MAX_BYTES) {
      return { success: false, error: "Image must be 3 MB or smaller." };
    }

    const admin = createAdminClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${employeeId}/${kind}-${Date.now()}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await admin.storage
      .from(STORAGE_BUCKETS.employeePhotos)
      .upload(path, bytes, { contentType: file.type, upsert: true });
    if (uploadError) return { success: false, error: uploadError.message };

    const {
      data: { publicUrl },
    } = admin.storage.from(STORAGE_BUCKETS.employeePhotos).getPublicUrl(path);

    const patch =
      kind === "photo"
        ? { photo_url: publicUrl }
        : { signature_url: publicUrl };
    const { error: updateError } = await admin
      .from("employees")
      .update({ ...patch, updated_by: user.id })
      .eq("id", employeeId);
    if (updateError) return { success: false, error: updateError.message };

    await recordAudit({
      actorId: user.id,
      action: "update",
      entity: "employees",
      entityId: employeeId,
      metadata: { section: kind },
    });

    revalidatePath(`${ROUTES.employees}/${employeeId}`);
    return { success: true, data: { url: publicUrl } };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, error: error.message };
    }
    logger.error("Employee image upload failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: "Upload failed. Please try again." };
  }
}

export async function uploadEmployeePhotoAction(formData: FormData) {
  return uploadImage(formData, "photo");
}

export async function uploadEmployeeSignatureAction(formData: FormData) {
  return uploadImage(formData, "signature");
}
