"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";

import type { ActionResult } from "@/types/common";
import { createAction, ActionError } from "@/server/safe-action";
import { recordAudit } from "@/server/audit";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { STORAGE_BUCKETS } from "@/constants";
import { uuidSchema } from "@/lib/validations";
import { assertPermission, AuthorizationError } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import {
  assetSchema,
  deleteSalarySchema,
  deleteSectionSchema,
  dependentSchema,
  documentMetaSchema,
  emergencyContactSchema,
  experienceSchema,
  noteSchema,
  qualificationSchema,
  salarySchema,
  updateSalarySchema,
} from "../schemas/sections.schema";
import { DOC_MAX_BYTES } from "../constants";

type AdminClient = ReturnType<typeof createAdminClient>;
const norm = (v: string | undefined) => (v && v.length > 0 ? v : null);
const yearOrNull = (v: string | undefined) => (v ? Number(v) : null);

function revalidateEmployee(employeeId: string) {
  revalidatePath(`${ROUTES.employees}/${employeeId}`);
}

async function auditSection(
  admin: AdminClient,
  actorId: string,
  employeeId: string,
  action: "create" | "update" | "delete",
  section: string,
) {
  void admin;
  await recordAudit({
    actorId,
    action,
    entity: "employees",
    entityId: employeeId,
    metadata: { section },
  });
}

// ── Generic soft-delete for employee:update sections ──
export const deleteEmployeeSection = createAction({
  input: deleteSectionSchema,
  permission: PERMISSIONS.EMPLOYEE_UPDATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { data: row } = await admin
      .from(input.section)
      .select("employee_id")
      .eq("id", input.id)
      .maybeSingle();
    if (!row) throw new ActionError("Record not found.");

    const { error } = await admin
      .from(input.section)
      .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);

    await auditSection(
      admin,
      user.id,
      row.employee_id,
      "delete",
      input.section,
    );
    revalidateEmployee(row.employee_id);
    return { ok: true };
  },
});

// ── Emergency contacts ──
export const addEmergencyContact = createAction({
  input: emergencyContactSchema,
  permission: PERMISSIONS.EMPLOYEE_UPDATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin.from("emergency_contacts").insert({
      employee_id: input.employee_id,
      name: input.name,
      relationship: norm(input.relationship),
      phone: input.phone,
      email: norm(input.email),
      address: norm(input.address),
      is_primary: input.is_primary,
      created_by: user.id,
    });
    if (error) throw new ActionError(error.message);
    await auditSection(
      admin,
      user.id,
      input.employee_id,
      "create",
      "emergency_contact",
    );
    revalidateEmployee(input.employee_id);
    return { ok: true };
  },
});

export const updateEmergencyContact = createAction({
  input: emergencyContactSchema.extend({ id: uuidSchema }),
  permission: PERMISSIONS.EMPLOYEE_UPDATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("emergency_contacts")
      .update({
        name: input.name,
        relationship: norm(input.relationship),
        phone: input.phone,
        email: norm(input.email),
        address: norm(input.address),
        is_primary: input.is_primary,
        updated_by: user.id,
      })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);
    await auditSection(
      admin,
      user.id,
      input.employee_id,
      "update",
      "emergency_contact",
    );
    revalidateEmployee(input.employee_id);
    return { ok: true };
  },
});

// ── Dependents ──
export const addDependent = createAction({
  input: dependentSchema,
  permission: PERMISSIONS.EMPLOYEE_UPDATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin.from("dependents").insert({
      employee_id: input.employee_id,
      name: input.name,
      relationship: norm(input.relationship),
      date_of_birth: norm(input.date_of_birth),
      gender: norm(input.gender),
      created_by: user.id,
    });
    if (error) throw new ActionError(error.message);
    await auditSection(
      admin,
      user.id,
      input.employee_id,
      "create",
      "dependent",
    );
    revalidateEmployee(input.employee_id);
    return { ok: true };
  },
});

export const updateDependent = createAction({
  input: dependentSchema.extend({ id: uuidSchema }),
  permission: PERMISSIONS.EMPLOYEE_UPDATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("dependents")
      .update({
        name: input.name,
        relationship: norm(input.relationship),
        date_of_birth: norm(input.date_of_birth),
        gender: norm(input.gender),
        updated_by: user.id,
      })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);
    await auditSection(
      admin,
      user.id,
      input.employee_id,
      "update",
      "dependent",
    );
    revalidateEmployee(input.employee_id);
    return { ok: true };
  },
});

// ── Qualifications ──
export const addQualification = createAction({
  input: qualificationSchema,
  permission: PERMISSIONS.EMPLOYEE_UPDATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin.from("qualifications").insert({
      employee_id: input.employee_id,
      degree: input.degree,
      institution: norm(input.institution),
      field_of_study: norm(input.field_of_study),
      start_year: yearOrNull(input.start_year),
      end_year: yearOrNull(input.end_year),
      grade: norm(input.grade),
      created_by: user.id,
    });
    if (error) throw new ActionError(error.message);
    await auditSection(
      admin,
      user.id,
      input.employee_id,
      "create",
      "qualification",
    );
    revalidateEmployee(input.employee_id);
    return { ok: true };
  },
});

export const updateQualification = createAction({
  input: qualificationSchema.extend({ id: uuidSchema }),
  permission: PERMISSIONS.EMPLOYEE_UPDATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("qualifications")
      .update({
        degree: input.degree,
        institution: norm(input.institution),
        field_of_study: norm(input.field_of_study),
        start_year: yearOrNull(input.start_year),
        end_year: yearOrNull(input.end_year),
        grade: norm(input.grade),
        updated_by: user.id,
      })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);
    await auditSection(
      admin,
      user.id,
      input.employee_id,
      "update",
      "qualification",
    );
    revalidateEmployee(input.employee_id);
    return { ok: true };
  },
});

// ── Experience ──
export const addExperience = createAction({
  input: experienceSchema,
  permission: PERMISSIONS.EMPLOYEE_UPDATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin.from("experiences").insert({
      employee_id: input.employee_id,
      company_name: input.company_name,
      job_title: norm(input.job_title),
      start_date: norm(input.start_date),
      end_date: norm(input.end_date),
      description: norm(input.description),
      created_by: user.id,
    });
    if (error) throw new ActionError(error.message);
    await auditSection(
      admin,
      user.id,
      input.employee_id,
      "create",
      "experience",
    );
    revalidateEmployee(input.employee_id);
    return { ok: true };
  },
});

export const updateExperience = createAction({
  input: experienceSchema.extend({ id: uuidSchema }),
  permission: PERMISSIONS.EMPLOYEE_UPDATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("experiences")
      .update({
        company_name: input.company_name,
        job_title: norm(input.job_title),
        start_date: norm(input.start_date),
        end_date: norm(input.end_date),
        description: norm(input.description),
        updated_by: user.id,
      })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);
    await auditSection(
      admin,
      user.id,
      input.employee_id,
      "update",
      "experience",
    );
    revalidateEmployee(input.employee_id);
    return { ok: true };
  },
});

// ── Assets ──
export const addAsset = createAction({
  input: assetSchema,
  permission: PERMISSIONS.EMPLOYEE_UPDATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin.from("employee_assets").insert({
      employee_id: input.employee_id,
      name: input.name,
      asset_tag: norm(input.asset_tag),
      category: norm(input.category),
      assigned_date: norm(input.assigned_date),
      return_date: norm(input.return_date),
      status: input.status,
      notes: norm(input.notes),
      created_by: user.id,
    });
    if (error) throw new ActionError(error.message);
    await auditSection(admin, user.id, input.employee_id, "create", "asset");
    revalidateEmployee(input.employee_id);
    return { ok: true };
  },
});

export const updateAsset = createAction({
  input: assetSchema.extend({ id: uuidSchema }),
  permission: PERMISSIONS.EMPLOYEE_UPDATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("employee_assets")
      .update({
        name: input.name,
        asset_tag: norm(input.asset_tag),
        category: norm(input.category),
        assigned_date: norm(input.assigned_date),
        return_date: norm(input.return_date),
        status: input.status,
        notes: norm(input.notes),
        updated_by: user.id,
      })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);
    await auditSection(admin, user.id, input.employee_id, "update", "asset");
    revalidateEmployee(input.employee_id);
    return { ok: true };
  },
});

// ── Notes ──
export const addNote = createAction({
  input: noteSchema,
  permission: PERMISSIONS.EMPLOYEE_UPDATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin.from("employee_notes").insert({
      employee_id: input.employee_id,
      body: input.body,
      created_by: user.id,
    });
    if (error) throw new ActionError(error.message);
    await auditSection(admin, user.id, input.employee_id, "create", "note");
    revalidateEmployee(input.employee_id);
    return { ok: true };
  },
});

// ── Documents (metadata edit; add/upload handled below) ──
export const updateDocument = createAction({
  input: documentMetaSchema.extend({ id: uuidSchema }),
  permission: PERMISSIONS.EMPLOYEE_UPDATE,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("employee_documents")
      .update({
        title: input.title,
        category: input.category,
        document_type: norm(input.document_type),
        number: norm(input.number),
        issue_date: norm(input.issue_date),
        expiry_date: norm(input.expiry_date),
        updated_by: user.id,
      })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);
    await auditSection(admin, user.id, input.employee_id, "update", "document");
    revalidateEmployee(input.employee_id);
    return { ok: true };
  },
});

/** Add a document (metadata + optional file upload to the private bucket). */
export async function addEmployeeDocumentAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await assertPermission(PERMISSIONS.EMPLOYEE_UPDATE);

    const parsed = documentMetaSchema.safeParse({
      employee_id: formData.get("employee_id"),
      title: formData.get("title"),
      category: formData.get("category") || "document",
      document_type: formData.get("document_type") || undefined,
      number: formData.get("number") || undefined,
      issue_date: formData.get("issue_date") || undefined,
      expiry_date: formData.get("expiry_date") || undefined,
    });
    if (!parsed.success) {
      return { success: false, error: "Please check the document details." };
    }
    const meta = parsed.data;

    const admin = createAdminClient();
    let filePatch: Record<string, unknown> = {};
    const file = formData.get("file");
    if (file instanceof File && file.size > 0) {
      if (file.size > DOC_MAX_BYTES) {
        return { success: false, error: "File must be 10 MB or smaller." };
      }
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `${meta.employee_id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await admin.storage
        .from(STORAGE_BUCKETS.employeeDocuments)
        .upload(path, await file.arrayBuffer(), {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
      if (uploadError) return { success: false, error: uploadError.message };
      filePatch = {
        file_url: path,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || null,
      };
    }

    const { error } = await admin.from("employee_documents").insert({
      employee_id: meta.employee_id,
      title: meta.title,
      category: meta.category,
      document_type: norm(meta.document_type),
      number: norm(meta.number),
      issue_date: norm(meta.issue_date),
      expiry_date: norm(meta.expiry_date),
      created_by: user.id,
      ...filePatch,
    });
    if (error) return { success: false, error: error.message };

    await recordAudit({
      actorId: user.id,
      action: "create",
      entity: "employees",
      entityId: meta.employee_id,
      metadata: { section: "document", title: meta.title },
    });
    revalidateEmployee(meta.employee_id);
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, error: error.message };
    }
    logger.error("Add employee document failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: "Failed to add document." };
  }
}

/** Signed URL to download a private document (short-lived). */
export async function getDocumentDownloadUrlAction(
  documentId: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    await assertPermission(PERMISSIONS.EMPLOYEE_VIEW);
    const admin = createAdminClient();
    const { data: doc } = await admin
      .from("employee_documents")
      .select("file_url")
      .eq("id", documentId)
      .is("deleted_at", null)
      .maybeSingle();
    if (!doc?.file_url) {
      return { success: false, error: "No file attached to this document." };
    }
    const { data, error } = await admin.storage
      .from(STORAGE_BUCKETS.employeeDocuments)
      .createSignedUrl(doc.file_url, 60);
    if (error || !data) {
      return { success: false, error: "Couldn’t generate a download link." };
    }
    return { success: true, data: { url: data.signedUrl } };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Download failed." };
  }
}

// ── Salary (payroll-gated) ──
const salaryValues = (input: z.infer<typeof salarySchema>) => ({
  effective_date: input.effective_date,
  currency: input.currency,
  basic: input.basic,
  housing_allowance: input.housing_allowance,
  transport_allowance: input.transport_allowance,
  other_allowances: input.other_allowances,
  deductions: input.deductions,
  notes: norm(input.notes),
});

export const addSalary = createAction({
  input: salarySchema,
  permission: PERMISSIONS.PAYROLL_PROCESS,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin.from("employee_salaries").insert({
      employee_id: input.employee_id,
      ...salaryValues(input),
      created_by: user.id,
    });
    if (error) throw new ActionError(error.message);
    await auditSection(admin, user.id, input.employee_id, "create", "salary");
    revalidateEmployee(input.employee_id);
    return { ok: true };
  },
});

export const updateSalary = createAction({
  input: updateSalarySchema,
  permission: PERMISSIONS.PAYROLL_PROCESS,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("employee_salaries")
      .update({ ...salaryValues(input), updated_by: user.id })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);
    await auditSection(admin, user.id, input.employee_id, "update", "salary");
    revalidateEmployee(input.employee_id);
    return { ok: true };
  },
});

export const deleteSalary = createAction({
  input: deleteSalarySchema,
  permission: PERMISSIONS.PAYROLL_PROCESS,
  handler: async ({ input, user }) => {
    const admin = createAdminClient();
    const { data: row } = await admin
      .from("employee_salaries")
      .select("employee_id")
      .eq("id", input.id)
      .maybeSingle();
    if (!row) throw new ActionError("Record not found.");
    const { error } = await admin
      .from("employee_salaries")
      .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
      .eq("id", input.id);
    if (error) throw new ActionError(error.message);
    await auditSection(admin, user.id, row.employee_id, "delete", "salary");
    revalidateEmployee(row.employee_id);
    return { ok: true };
  },
});
