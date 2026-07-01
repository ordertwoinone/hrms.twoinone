import { z } from "zod";

import { uuidSchema } from "@/lib/validations";

/** Shared department fields for create and edit. */
export const departmentFormSchema = z.object({
  name: z.string().trim().min(2, "Department name is required.").max(120),
  code: z
    .string()
    .trim()
    .min(1, "Code is required.")
    .max(30)
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and dashes only."),
  description: z.string().trim().max(500).optional(),
  branch_id: z.union([uuidSchema, z.literal("")]).optional(),
  head_id: z.union([uuidSchema, z.literal("")]).optional(),
  parent_id: z.union([uuidSchema, z.literal("")]).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});
export type DepartmentFormInput = z.infer<typeof departmentFormSchema>;

export const createDepartmentSchema = departmentFormSchema;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

export const updateDepartmentSchema = departmentFormSchema.extend({
  id: uuidSchema,
});
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

export const deleteDepartmentSchema = z.object({ id: uuidSchema });
export type DeleteDepartmentInput = z.infer<typeof deleteDepartmentSchema>;

export const setDepartmentStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(["active", "inactive"]),
});
export type SetDepartmentStatusInput = z.infer<
  typeof setDepartmentStatusSchema
>;
