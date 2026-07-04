import { z } from "zod";

import { uuidSchema } from "@/lib/validations";

const dateReq = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date.");
const money = z.coerce.number().min(0).max(10_000_000);
const optText = (max: number) => z.string().trim().max(max).optional();

/** Salary revision — inserts a new dated row in employee_salaries. */
export const reviseSalarySchema = z.object({
  employee_id: uuidSchema,
  effective_date: dateReq,
  currency: z.string().trim().min(1).max(8).default("AED"),
  basic: money.default(0),
  housing_allowance: money.default(0),
  transport_allowance: money.default(0),
  other_allowances: money.default(0),
  deductions: money.default(0),
  notes: optText(500),
});
export type ReviseSalaryInput = z.infer<typeof reviseSalarySchema>;

export const loanFormSchema = z.object({
  employee_id: uuidSchema,
  loan_type: z.string().trim().min(1, "Loan type is required.").max(60),
  principal: money,
  monthly_deduction: money,
  outstanding: money,
  start_date: dateReq,
  status: z.enum(["active", "closed", "cancelled"]).default("active"),
  notes: optText(500),
});
export type LoanFormInput = z.infer<typeof loanFormSchema>;
export const updateLoanSchema = loanFormSchema.extend({ id: uuidSchema });
export const deleteLoanSchema = z.object({ id: uuidSchema });

export const createRunSchema = z.object({
  period_year: z.coerce.number().int().min(2000).max(2100),
  period_month: z.coerce.number().int().min(1).max(12),
  notes: optText(500),
});
export type CreateRunInput = z.infer<typeof createRunSchema>;

export const updatePayslipSchema = z.object({
  id: uuidSchema,
  overtime: money.default(0),
  bonus: money.default(0),
  commission: money.default(0),
  deductions: money.default(0),
  tax: money.default(0),
  notes: optText(500),
});
export type UpdatePayslipInput = z.infer<typeof updatePayslipSchema>;

export const reviewRunSchema = z.object({
  run_id: uuidSchema,
  note: optText(500),
});
export type ReviewRunInput = z.infer<typeof reviewRunSchema>;
