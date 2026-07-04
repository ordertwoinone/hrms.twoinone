import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface PayrollConfigData {
  overtimeRateWeekday: number;
  overtimeRateWeekend: number;
  overtimeRateHoliday: number;
  housingAllowance: number;
  transportAllowance: number;
  mealAllowance: number;
  otherAllowance: number;
  payrollDay: number;
  currency: string;
  gratuityEnabled: boolean;
  gratuity5yrRate: number;
  gratuity5yrPlusRate: number;
  agentId: string | null;
  employerId: string | null;
  bankRoutingCode: string | null;
}

export interface SystemPrefsData {
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  fiscalYearStartMonth: number;
  workWeekStart: string;
  workDays: string[];
  enableSelfService: boolean;
  enableOvertimeModule: boolean;
  enableRecruitmentModule: boolean;
  enablePerformanceModule: boolean;
  enableTrainingModule: boolean;
  notifyLeaveApproval: boolean;
  notifyContractExpiry: boolean;
  notifyDocumentExpiry: boolean;
  notifyBirthday: boolean;
}

export async function getPayrollConfig(): Promise<PayrollConfigData> {
  const admin = createAdminClient();
  const { data } = await admin.from("payroll_config").select("*").maybeSingle();

  return {
    overtimeRateWeekday: Number(data?.overtime_rate_weekday ?? 1.25),
    overtimeRateWeekend: Number(data?.overtime_rate_weekend ?? 1.5),
    overtimeRateHoliday: Number(data?.overtime_rate_holiday ?? 2.0),
    housingAllowance: Number(data?.housing_allowance ?? 0),
    transportAllowance: Number(data?.transport_allowance ?? 0),
    mealAllowance: Number(data?.meal_allowance ?? 0),
    otherAllowance: Number(data?.other_allowance ?? 0),
    payrollDay: data?.payroll_day ?? 25,
    currency: data?.currency ?? "AED",
    gratuityEnabled: data?.gratuity_enabled ?? true,
    gratuity5yrRate: Number(data?.gratuity_5yr_rate ?? 21),
    gratuity5yrPlusRate: Number(data?.gratuity_5yr_plus_rate ?? 30),
    agentId: data?.agent_id ?? null,
    employerId: data?.employer_id ?? null,
    bankRoutingCode: data?.bank_routing_code ?? null,
  };
}

export async function getSystemPreferences(): Promise<SystemPrefsData> {
  const admin = createAdminClient();
  const { data } = await admin.from("system_preferences").select("*").maybeSingle();

  return {
    timezone: data?.timezone ?? "Asia/Dubai",
    dateFormat: data?.date_format ?? "DD/MM/YYYY",
    timeFormat: data?.time_format ?? "12h",
    language: data?.language ?? "en",
    fiscalYearStartMonth: data?.fiscal_year_start_month ?? 1,
    workWeekStart: data?.work_week_start ?? "sunday",
    workDays: data?.work_days ?? ["sunday", "monday", "tuesday", "wednesday", "thursday"],
    enableSelfService: data?.enable_self_service ?? true,
    enableOvertimeModule: data?.enable_overtime_module ?? true,
    enableRecruitmentModule: data?.enable_recruitment_module ?? true,
    enablePerformanceModule: data?.enable_performance_module ?? true,
    enableTrainingModule: data?.enable_training_module ?? true,
    notifyLeaveApproval: data?.notify_leave_approval ?? true,
    notifyContractExpiry: data?.notify_contract_expiry ?? true,
    notifyDocumentExpiry: data?.notify_document_expiry ?? true,
    notifyBirthday: data?.notify_birthday ?? true,
  };
}
