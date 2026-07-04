import { z } from "zod";

import { uuidSchema } from "@/lib/validations";
import { LEAVE_COLOR_VARIANTS } from "../constants";

const dateReq = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date.");
const optText = (max: number) => z.string().trim().max(max).optional();

/** Apply for leave (validated from the multipart form; the file is separate). */
export const applyLeaveSchema = z
  .object({
    employee_id: uuidSchema,
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
export type ApplyLeaveInput = z.infer<typeof applyLeaveSchema>;

export const reviewLeaveSchema = z.object({
  request_id: uuidSchema,
  note: optText(300),
});
export type ReviewLeaveInput = z.infer<typeof reviewLeaveSchema>;

export const cancelLeaveSchema = z.object({ id: uuidSchema });

// ── Leave types (config) ──
export const leaveTypeFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(80),
  code: z
    .string()
    .trim()
    .min(1, "Code is required.")
    .max(16)
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and dashes only."),
  description: optText(300),
  days_per_year: z.coerce.number().min(0).max(366).default(0),
  is_paid: z.boolean().default(true),
  requires_attachment: z.boolean().default(false),
  gender_restriction: z
    .union([z.enum(["male", "female"]), z.literal("")])
    .optional(),
  color: z.enum(LEAVE_COLOR_VARIANTS as unknown as [string, ...string[]]),
  status: z.enum(["active", "inactive"]).default("active"),
});
export type LeaveTypeFormInput = z.infer<typeof leaveTypeFormSchema>;
export const updateLeaveTypeSchema = leaveTypeFormSchema.extend({
  id: uuidSchema,
});
export const deleteLeaveTypeSchema = z.object({ id: uuidSchema });

// ── Balance allocation ──
export const allocateBalanceSchema = z.object({
  employee_id: uuidSchema,
  leave_type_id: uuidSchema,
  year: z.coerce.number().int().min(2000).max(2100),
  allocated: z.coerce.number().min(0).max(366),
  carried_forward: z.coerce.number().min(0).max(366).default(0),
});
export type AllocateBalanceInput = z.infer<typeof allocateBalanceSchema>;
