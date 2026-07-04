import { z } from "zod";

import { uuidSchema } from "@/lib/validations";

const optText = (max: number) => z.string().trim().max(max).optional();
const dateReq = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date.");

export const updateContactSchema = z.object({
  phone: optText(40),
  personal_email: z
    .union([z.string().trim().email(), z.literal("")])
    .optional(),
  address_line: optText(200),
  city: optText(80),
  country: optText(80),
});
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

export const applyLeaveSelfSchema = z
  .object({
    leave_type_id: uuidSchema,
    start_date: dateReq,
    end_date: dateReq,
    is_half_day: z.boolean().default(false),
    half_day_period: z
      .union([z.enum(["first", "second"]), z.literal("")])
      .optional(),
    reason: optText(500),
  })
  .refine((d) => d.is_half_day || d.end_date >= d.start_date, {
    message: "End date must be on or after the start date.",
    path: ["end_date"],
  });
export type ApplyLeaveSelfInput = z.infer<typeof applyLeaveSelfSchema>;

export const requestLetterSchema = z.object({
  letter_type: z.string().trim().min(1, "Letter type is required.").max(80),
  addressed_to: optText(120),
  purpose: optText(500),
});
export type RequestLetterInput = z.infer<typeof requestLetterSchema>;
