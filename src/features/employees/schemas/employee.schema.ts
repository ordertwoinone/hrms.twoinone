import { z } from "zod";

import { emailSchema, uuidSchema } from "@/lib/validations";

const optText = (max: number) => z.string().trim().max(max).optional();
const optEmail = z.union([emailSchema, z.literal("")]).optional();
const optUuid = z.union([uuidSchema, z.literal("")]).optional();
const optDate = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date.");
const optGender = z
  .union([z.enum(["male", "female", "other"]), z.literal("")])
  .optional();

export const employeeFormSchema = z.object({
  employee_code: z
    .string()
    .trim()
    .min(1, "Employee code is required.")
    .max(30)
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and dashes only."),
  first_name: z.string().trim().min(1, "First name is required.").max(80),
  last_name: z.string().trim().min(1, "Last name is required.").max(80),
  work_email: optEmail,
  personal_email: optEmail,
  phone: optText(40),
  gender: optGender,
  date_of_birth: optDate,
  marital_status: optText(30),
  nationality: optText(60),
  department_id: optUuid,
  designation_id: optUuid,
  branch_id: optUuid,
  employment_type_id: optUuid,
  manager_id: optUuid,
  date_of_joining: optDate,
  date_of_leaving: optDate,
  work_location: optText(120),
  address_line: optText(300),
  city: optText(120),
  country: optText(80),
  status: z
    .enum(["active", "probation", "on_leave", "inactive", "terminated"])
    .default("active"),
});
export type EmployeeFormInput = z.infer<typeof employeeFormSchema>;

export const createEmployeeSchema = employeeFormSchema;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = employeeFormSchema.extend({
  id: uuidSchema,
});
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export const deleteEmployeeSchema = z.object({ id: uuidSchema });
export type DeleteEmployeeInput = z.infer<typeof deleteEmployeeSchema>;

export const setEmployeeStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(["active", "probation", "on_leave", "inactive", "terminated"]),
});
export type SetEmployeeStatusInput = z.infer<typeof setEmployeeStatusSchema>;
