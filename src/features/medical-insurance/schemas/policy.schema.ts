import { z } from "zod";

import { uuidSchema } from "@/lib/validations";

const dateReq = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date.");
const dateOpt = z
  .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")])
  .optional();
const optText = (max: number) => z.string().trim().max(max).optional();

export const policyFormSchema = z
  .object({
    employee_id: uuidSchema,
    provider: z.string().trim().min(1, "Provider is required.").max(80),
    policy_number: z
      .string()
      .trim()
      .min(1, "Policy number is required.")
      .max(60),
    coverage: z.string().trim().min(1, "Coverage is required.").max(60),
    dependents_covered: z.coerce.number().int().min(0).max(50).default(0),
    issue_date: dateReq,
    expiry_date: dateReq,
    renewal_date: dateOpt,
    status: z
      .enum(["active", "in_process", "renewed", "cancelled", "expired"])
      .default("active"),
    claims_notes: optText(2000),
  })
  .refine((d) => d.expiry_date >= d.issue_date, {
    message: "Expiry date must be on or after the issue date.",
    path: ["expiry_date"],
  });
export type PolicyFormInput = z.infer<typeof policyFormSchema>;

export const deletePolicySchema = z.object({ id: uuidSchema });
