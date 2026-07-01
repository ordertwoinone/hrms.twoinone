import { z } from "zod";

import { emailSchema, uuidSchema } from "@/lib/validations";

const trnSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (v) => !v || /^\d{15}$/.test(v),
    "TRN must be 15 digits (UAE Tax Registration Number).",
  );

const phoneSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (v) => !v || /^(?:\+?\d[\d\s-]{6,})$/.test(v),
    "Enter a valid phone number.",
  );

const websiteSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (v) => !v || /^https?:\/\/[^\s.]+\.[^\s]+$/.test(v),
    "Enter a valid URL, e.g. https://example.com",
  );

const timeSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (v) => !v || /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
    "Enter a valid time (HH:MM).",
  );

export const updateCompanySchema = z
  .object({
    id: uuidSchema,
    name: z.string().trim().min(2, "Company name is required.").max(160),
    trade_license_number: z.string().trim().max(60).optional(),
    tax_registration_number: trnSchema,
    email: z.union([emailSchema, z.literal("")]).optional(),
    phone: phoneSchema,
    website: websiteSchema,
    address_line: z.string().trim().max(300).optional(),
    city: z.string().trim().max(120).optional(),
    country: z.string().trim().min(1, "Country is required."),
    timezone: z.string().trim().min(1, "Timezone is required."),
    currency: z.string().trim().min(1, "Currency is required."),
    working_days: z
      .array(z.number().int().min(0).max(6))
      .min(1, "Select at least one working day."),
    office_start_time: timeSchema,
    office_end_time: timeSchema,
  })
  .refine(
    (d) =>
      !d.office_start_time ||
      !d.office_end_time ||
      d.office_end_time > d.office_start_time,
    {
      message: "End time must be after start time.",
      path: ["office_end_time"],
    },
  );
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export const addHolidaySchema = z.object({
  company_id: uuidSchema,
  name: z.string().trim().min(2, "Holiday name is required.").max(120),
  holiday_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date."),
  is_recurring: z.boolean().default(false),
});
export type AddHolidayInput = z.infer<typeof addHolidaySchema>;

export const deleteHolidaySchema = z.object({ id: uuidSchema });
export type DeleteHolidayInput = z.infer<typeof deleteHolidaySchema>;
