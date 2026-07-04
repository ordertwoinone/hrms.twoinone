import { z } from "zod";

import { uuidSchema } from "@/lib/validations";

const dateReq = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date.");
const dateOpt = z
  .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")])
  .optional();
const optText = (max: number) => z.string().trim().max(max).optional();

export const contractFormSchema = z
  .object({
    employee_id: uuidSchema,
    contract_type: z.string().trim().min(1, "Contract type is required.").max(60),
    start_date: dateReq,
    end_date: dateOpt,
    notice_period_days: z.coerce.number().int().min(0).max(365).default(30),
    renewal_date: dateOpt,
    status: z
      .enum(["draft", "pending", "active", "expired", "terminated", "renewed"])
      .default("draft"),
    notes: optText(1000),
  })
  .refine((d) => !d.end_date || d.end_date >= d.start_date, {
    message: "End date must be on or after the start date.",
    path: ["end_date"],
  });
export type ContractFormInput = z.infer<typeof contractFormSchema>;

export const reviewContractSchema = z.object({
  contract_id: uuidSchema,
  note: optText(500),
});
export type ReviewContractInput = z.infer<typeof reviewContractSchema>;

export const deleteContractSchema = z.object({ id: uuidSchema });
