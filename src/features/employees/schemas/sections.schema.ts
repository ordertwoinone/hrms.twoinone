import { z } from "zod";

import { emailSchema, uuidSchema } from "@/lib/validations";

const optText = (max: number) => z.string().trim().max(max).optional();
const optEmail = z.union([emailSchema, z.literal("")]).optional();
const optDate = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date.");
const optYear = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^\d{4}$/.test(v), "Enter a 4-digit year.");
const money = z.coerce.number().min(0, "Must be 0 or more").default(0);

/** Child tables whose writes are gated by `employee:update`. */
export const SECTION_TABLES = [
  "employee_documents",
  "emergency_contacts",
  "dependents",
  "qualifications",
  "experiences",
  "employee_assets",
  "employee_notes",
] as const;

export const deleteSectionSchema = z.object({
  section: z.enum(SECTION_TABLES),
  id: uuidSchema,
});
export type DeleteSectionInput = z.infer<typeof deleteSectionSchema>;

// ── Documents (metadata; the file is handled via FormData in the action) ──
export const documentMetaSchema = z.object({
  employee_id: uuidSchema,
  title: z.string().trim().min(1, "Title is required.").max(160),
  category: z.enum(["document", "attachment"]).default("document"),
  document_type: optText(40),
  number: optText(60),
  issue_date: optDate,
  expiry_date: optDate,
});
export type DocumentMetaInput = z.infer<typeof documentMetaSchema>;

// ── Salary (payroll-gated) ──
export const salarySchema = z.object({
  employee_id: uuidSchema,
  effective_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Select an effective date."),
  currency: z.string().trim().min(1).max(6).default("AED"),
  basic: money,
  housing_allowance: money,
  transport_allowance: money,
  other_allowances: money,
  deductions: money,
  notes: optText(300),
});
export type SalaryInput = z.infer<typeof salarySchema>;
export const updateSalarySchema = salarySchema.extend({ id: uuidSchema });
export type UpdateSalaryInput = z.infer<typeof updateSalarySchema>;
export const deleteSalarySchema = z.object({ id: uuidSchema });

// ── Emergency contacts ──
export const emergencyContactSchema = z.object({
  employee_id: uuidSchema,
  name: z.string().trim().min(1, "Name is required.").max(120),
  relationship: optText(40),
  phone: z.string().trim().min(1, "Phone is required.").max(40),
  email: optEmail,
  address: optText(300),
  is_primary: z.boolean().default(false),
});
export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;

// ── Dependents ──
export const dependentSchema = z.object({
  employee_id: uuidSchema,
  name: z.string().trim().min(1, "Name is required.").max(120),
  relationship: optText(40),
  date_of_birth: optDate,
  gender: z
    .union([z.enum(["male", "female", "other"]), z.literal("")])
    .optional(),
});
export type DependentInput = z.infer<typeof dependentSchema>;

// ── Qualifications ──
export const qualificationSchema = z.object({
  employee_id: uuidSchema,
  degree: z.string().trim().min(1, "Degree is required.").max(120),
  institution: optText(160),
  field_of_study: optText(120),
  start_year: optYear,
  end_year: optYear,
  grade: optText(40),
});
export type QualificationInput = z.infer<typeof qualificationSchema>;

// ── Experience ──
export const experienceSchema = z.object({
  employee_id: uuidSchema,
  company_name: z.string().trim().min(1, "Company is required.").max(160),
  job_title: optText(120),
  start_date: optDate,
  end_date: optDate,
  description: optText(500),
});
export type ExperienceInput = z.infer<typeof experienceSchema>;

// ── Assets ──
export const assetSchema = z.object({
  employee_id: uuidSchema,
  name: z.string().trim().min(1, "Asset name is required.").max(120),
  asset_tag: optText(60),
  category: optText(60),
  assigned_date: optDate,
  return_date: optDate,
  status: z.enum(["assigned", "returned"]).default("assigned"),
  notes: optText(300),
});
export type AssetInput = z.infer<typeof assetSchema>;

// ── Notes ──
export const noteSchema = z.object({
  employee_id: uuidSchema,
  body: z.string().trim().min(1, "Note can’t be empty.").max(2000),
});
export type NoteInput = z.infer<typeof noteSchema>;
