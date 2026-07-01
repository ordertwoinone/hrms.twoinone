import { z } from "zod";

import { uuidSchema } from "@/lib/validations";

/** Shared designation fields for create and edit. */
export const designationFormSchema = z.object({
  name: z.string().trim().min(2, "Designation name is required.").max(120),
  department_id: z.union([uuidSchema, z.literal("")]).optional(),
  grade: z.string().trim().max(40).optional(),
  description: z.string().trim().max(500).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});
export type DesignationFormInput = z.infer<typeof designationFormSchema>;

export const createDesignationSchema = designationFormSchema;
export type CreateDesignationInput = z.infer<typeof createDesignationSchema>;

export const updateDesignationSchema = designationFormSchema.extend({
  id: uuidSchema,
});
export type UpdateDesignationInput = z.infer<typeof updateDesignationSchema>;

export const deleteDesignationSchema = z.object({ id: uuidSchema });
export type DeleteDesignationInput = z.infer<typeof deleteDesignationSchema>;

export const setDesignationStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(["active", "inactive"]),
});
export type SetDesignationStatusInput = z.infer<
  typeof setDesignationStatusSchema
>;
