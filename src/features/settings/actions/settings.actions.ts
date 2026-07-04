"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { recordAudit } from "@/server/audit";
import type { ActionResult } from "@/types/common";

const PayrollConfigSchema = z.object({
  overtimeRateWeekday: z.number().min(1).max(5),
  overtimeRateWeekend: z.number().min(1).max(5),
  overtimeRateHoliday: z.number().min(1).max(5),
  housingAllowance: z.number().min(0),
  transportAllowance: z.number().min(0),
  mealAllowance: z.number().min(0),
  otherAllowance: z.number().min(0),
  payrollDay: z.number().int().min(1).max(28),
  currency: z.string().max(3),
  gratuityEnabled: z.boolean(),
  gratuity5yrRate: z.number().min(0).max(30),
  gratuity5yrPlusRate: z.number().min(0).max(30),
  agentId: z.string().max(50).nullable().optional(),
  employerId: z.string().max(50).nullable().optional(),
  bankRoutingCode: z.string().max(50).nullable().optional(),
});

export async function savePayrollConfig(
  input: z.infer<typeof PayrollConfigSchema>,
): Promise<ActionResult<{ saved: true }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthenticated" };

  const parsed = PayrollConfigSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const admin = createAdminClient();
  const { data: emp } = await admin
    .from("employees")
    .select("company_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!emp?.company_id) return { success: false, error: "No company" };

  const d = parsed.data;
  const payload = {
    company_id: emp.company_id,
    overtime_rate_weekday: d.overtimeRateWeekday,
    overtime_rate_weekend: d.overtimeRateWeekend,
    overtime_rate_holiday: d.overtimeRateHoliday,
    housing_allowance: d.housingAllowance,
    transport_allowance: d.transportAllowance,
    meal_allowance: d.mealAllowance,
    other_allowance: d.otherAllowance,
    payroll_day: d.payrollDay,
    currency: d.currency,
    gratuity_enabled: d.gratuityEnabled,
    gratuity_5yr_rate: d.gratuity5yrRate,
    gratuity_5yr_plus_rate: d.gratuity5yrPlusRate,
    agent_id: d.agentId ?? null,
    employer_id: d.employerId ?? null,
    bank_routing_code: d.bankRoutingCode ?? null,
    updated_by: user.id,
  };

  const { error } = await admin
    .from("payroll_config")
    .upsert(payload, { onConflict: "company_id" });

  if (error) return { success: false, error: error.message };
  await recordAudit({ actorId: user.id, action: "update", entity: "payroll_config", entityId: emp.company_id });
  return { success: true, data: { saved: true } };
}

const SystemPrefsSchema = z.object({
  timezone: z.string(),
  dateFormat: z.string(),
  timeFormat: z.enum(["12h", "24h"]),
  language: z.string(),
  fiscalYearStartMonth: z.number().int().min(1).max(12),
  workWeekStart: z.enum(["sunday", "monday"]),
  workDays: z.array(z.string()).min(1),
  enableSelfService: z.boolean(),
  enableOvertimeModule: z.boolean(),
  enableRecruitmentModule: z.boolean(),
  enablePerformanceModule: z.boolean(),
  enableTrainingModule: z.boolean(),
  notifyLeaveApproval: z.boolean(),
  notifyContractExpiry: z.boolean(),
  notifyDocumentExpiry: z.boolean(),
  notifyBirthday: z.boolean(),
});

export async function saveSystemPreferences(
  input: z.infer<typeof SystemPrefsSchema>,
): Promise<ActionResult<{ saved: true }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthenticated" };

  const parsed = SystemPrefsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const admin = createAdminClient();
  const { data: emp } = await admin
    .from("employees")
    .select("company_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!emp?.company_id) return { success: false, error: "No company" };

  const d = parsed.data;
  const { error } = await admin
    .from("system_preferences")
    .upsert({
      company_id: emp.company_id,
      timezone: d.timezone,
      date_format: d.dateFormat,
      time_format: d.timeFormat,
      language: d.language,
      fiscal_year_start_month: d.fiscalYearStartMonth,
      work_week_start: d.workWeekStart,
      work_days: d.workDays,
      enable_self_service: d.enableSelfService,
      enable_overtime_module: d.enableOvertimeModule,
      enable_recruitment_module: d.enableRecruitmentModule,
      enable_performance_module: d.enablePerformanceModule,
      enable_training_module: d.enableTrainingModule,
      notify_leave_approval: d.notifyLeaveApproval,
      notify_contract_expiry: d.notifyContractExpiry,
      notify_document_expiry: d.notifyDocumentExpiry,
      notify_birthday: d.notifyBirthday,
      updated_by: user.id,
    }, { onConflict: "company_id" });

  if (error) return { success: false, error: error.message };
  await recordAudit({ actorId: user.id, action: "update", entity: "system_preferences", entityId: emp.company_id });
  return { success: true, data: { saved: true } };
}
