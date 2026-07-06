import { z } from "zod";

import { uuidSchema } from "@/lib/validations";

const dateReq = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date.");
const money = z.coerce.number().min(0).max(10_000_000);
const pct = z.coerce.number().min(0).max(1);
const optText = (max: number) => z.string().trim().max(max).optional();

export const CURRENCY_CODES = ["AED", "USD", "EUR", "GBP", "SAR", "QAR", "KWD", "BHD", "OMR"] as const;
const currencyEnum = z.enum(CURRENCY_CODES).default("AED");

/** Salary revision — inserts a new dated row in employee_salaries. */
export const reviseSalarySchema = z.object({
  employee_id: uuidSchema,
  effective_date: dateReq,
  currency: currencyEnum,
  basic: money.default(0),
  housing_allowance: money.default(0),
  transport_allowance: money.default(0),
  food_allowance: money.default(0),
  telephone_allowance: money.default(0),
  other_allowances: money.default(0),
  commission_fixed: money.default(0),
  deductions: money.default(0),
  overtime_rate_multiplier: z.coerce.number().min(1).max(5).default(1.25),
  social_security_employee_pct: pct.default(0),
  social_security_employer_pct: pct.default(0),
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

export const advanceFormSchema = z.object({
  employee_id: uuidSchema,
  amount: z.coerce.number().min(1).max(10_000_000),
  advance_date: dateReq,
  repayment_months: z.coerce.number().int().min(1).max(24).default(1),
  reason: optText(500),
  notes: optText(500),
});
export type AdvanceFormInput = z.infer<typeof advanceFormSchema>;

export const updateAdvanceSchema = advanceFormSchema.extend({ id: uuidSchema });
export const advanceIdSchema = z.object({
  id: uuidSchema,
  remarks: optText(500),
});
export type AdvanceIdInput = z.infer<typeof advanceIdSchema>;

export const bonusFormSchema = z.object({
  employee_id: uuidSchema,
  bonus_type: z.enum(["performance", "annual", "festival", "referral", "retention", "spot", "other"]),
  amount: z.coerce.number().min(1).max(10_000_000),
  effective_month: z.coerce.number().int().min(1).max(12),
  effective_year: z.coerce.number().int().min(2000).max(2100),
  description: optText(500),
  notes: optText(500),
});
export type BonusFormInput = z.infer<typeof bonusFormSchema>;

export const bonusIdSchema = z.object({
  id: uuidSchema,
  remarks: optText(500),
});
export type BonusIdInput = z.infer<typeof bonusIdSchema>;

export const bankAccountFormSchema = z.object({
  employee_id: uuidSchema,
  bank_name: z.string().trim().min(1).max(120),
  account_number: z.string().trim().min(1).max(30),
  iban: z.string().trim().min(10).max(34),
  account_holder_name: z.string().trim().min(1).max(120),
  currency: currencyEnum,
  is_primary: z.boolean().default(false),
  notes: optText(500),
});
export type BankAccountFormInput = z.infer<typeof bankAccountFormSchema>;

export const updateBankAccountSchema = bankAccountFormSchema.extend({ id: uuidSchema });
export const deleteBankAccountSchema = z.object({ id: uuidSchema });

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
  penalty: money.default(0),
  tax: money.default(0),
  notes: optText(500),
});
export type UpdatePayslipInput = z.infer<typeof updatePayslipSchema>;

export const reviewRunSchema = z.object({
  run_id: uuidSchema,
  note: optText(500),
});
export type ReviewRunInput = z.infer<typeof reviewRunSchema>;
