import { z } from "zod";

import { emailSchema, uuidSchema } from "@/lib/validations";

const phoneSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (v) => !v || /^(?:\+?\d[\d\s-]{6,})$/.test(v),
    "Enter a valid phone number.",
  );

/** Shared branch fields used by both create and edit. */
export const branchFormSchema = z.object({
  name: z.string().trim().min(2, "Branch name is required.").max(120),
  code: z
    .string()
    .trim()
    .min(1, "Code is required.")
    .max(30)
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and dashes only."),
  address_line: z.string().trim().max(300).optional(),
  city: z.string().trim().max(120).optional(),
  country: z.string().trim().min(1, "Country is required."),
  phone: phoneSchema,
  email: z.union([emailSchema, z.literal("")]).optional(),
  manager_id: z.union([uuidSchema, z.literal("")]).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});
export type BranchFormInput = z.infer<typeof branchFormSchema>;

export const createBranchSchema = branchFormSchema;
export type CreateBranchInput = z.infer<typeof createBranchSchema>;

export const updateBranchSchema = branchFormSchema.extend({ id: uuidSchema });
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;

export const deleteBranchSchema = z.object({ id: uuidSchema });
export type DeleteBranchInput = z.infer<typeof deleteBranchSchema>;

export const setBranchStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(["active", "inactive"]),
});
export type SetBranchStatusInput = z.infer<typeof setBranchStatusSchema>;
