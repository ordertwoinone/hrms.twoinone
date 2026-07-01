import { z } from "zod";

import { uuidSchema } from "@/lib/validations";

/** Shared employment-type fields for create and edit. */
export const employmentTypeFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(80),
  description: z.string().trim().max(500).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});
export type EmploymentTypeFormInput = z.infer<typeof employmentTypeFormSchema>;

export const createEmploymentTypeSchema = employmentTypeFormSchema;
export type CreateEmploymentTypeInput = z.infer<
  typeof createEmploymentTypeSchema
>;

export const updateEmploymentTypeSchema = employmentTypeFormSchema.extend({
  id: uuidSchema,
});
export type UpdateEmploymentTypeInput = z.infer<
  typeof updateEmploymentTypeSchema
>;

export const deleteEmploymentTypeSchema = z.object({ id: uuidSchema });
export type DeleteEmploymentTypeInput = z.infer<
  typeof deleteEmploymentTypeSchema
>;

export const setEmploymentTypeStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(["active", "inactive"]),
});
export type SetEmploymentTypeStatusInput = z.infer<
  typeof setEmploymentTypeStatusSchema
>;
