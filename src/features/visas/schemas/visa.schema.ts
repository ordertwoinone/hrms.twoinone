import { z } from "zod";

import { uuidSchema } from "@/lib/validations";

const dateReq = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date.");
const dateOpt = z
  .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")])
  .optional();
const optText = (max: number) => z.string().trim().max(max).optional();

export const visaFormSchema = z
  .object({
    employee_id: uuidSchema,
    visa_number: z.string().trim().min(1, "Visa number is required.").max(60),
    visa_type: z.string().trim().min(1, "Visa type is required.").max(60),
    sponsor: optText(120),
    passport_number: optText(40),
    issue_date: dateReq,
    expiry_date: dateReq,
    renewal_date: dateOpt,
    status: z
      .enum(["active", "in_process", "renewed", "cancelled", "expired"])
      .default("active"),
    notes: optText(500),
  })
  .refine((d) => d.expiry_date >= d.issue_date, {
    message: "Expiry date must be on or after the issue date.",
    path: ["expiry_date"],
  });
export type VisaFormInput = z.infer<typeof visaFormSchema>;

export const deleteVisaSchema = z.object({ id: uuidSchema });
