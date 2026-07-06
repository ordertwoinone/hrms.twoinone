import "server-only";

import { LOCALE } from "@/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SalaryStructureItem } from "../types";

const num = (v: unknown) => Number(v ?? 0);

export async function getSalaryStructures(): Promise<SalaryStructureItem[]> {
  const admin = createAdminClient();
  const [{ data: employees }, { data: salaries }] = await Promise.all([
    admin
      .from("employees")
      .select("id, first_name, last_name, employee_code")
      .is("deleted_at", null)
      .eq("status", "active")
      .order("first_name"),
    admin
      .from("employee_salaries")
      .select(
        "employee_id, currency, basic, housing_allowance, transport_allowance, food_allowance, telephone_allowance, other_allowances, commission_fixed, deductions, overtime_rate_multiplier, social_security_employee_pct, social_security_employer_pct, effective_date",
      )
      .is("deleted_at", null)
      .order("effective_date", { ascending: false }),
  ]);

  type SalaryRow = NonNullable<typeof salaries>[number];
  const latest = new Map<string, SalaryRow>();
  for (const s of salaries ?? []) {
    if (!latest.has(s.employee_id)) latest.set(s.employee_id, s);
  }

  return (employees ?? []).map((e) => {
    const s = latest.get(e.id);
    const basic = num(s?.basic);
    const housing = num(s?.housing_allowance);
    const transport = num(s?.transport_allowance);
    const food = num(s?.food_allowance);
    const telephone = num(s?.telephone_allowance);
    const other = num(s?.other_allowances);
    const commissionFixed = num(s?.commission_fixed);
    return {
      employeeId: e.id,
      employeeName: `${e.first_name} ${e.last_name}`,
      employeeCode: e.employee_code,
      currency: s?.currency ?? LOCALE.currency,
      basic,
      housing,
      transport,
      food,
      telephone,
      other,
      commissionFixed,
      deductions: num(s?.deductions),
      overtimeRateMultiplier: num(s?.overtime_rate_multiplier) || 1.25,
      ssEmployeePct: num(s?.social_security_employee_pct),
      ssEmployerPct: num(s?.social_security_employer_pct),
      gross: basic + housing + transport + food + telephone + other + commissionFixed,
      effectiveDate: s?.effective_date ?? null,
    };
  });
}

export async function getSalaryHistory(employeeId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("employee_salaries")
    .select(
      "id, effective_date, currency, basic, housing_allowance, transport_allowance, food_allowance, telephone_allowance, other_allowances, commission_fixed, deductions, overtime_rate_multiplier, social_security_employee_pct, social_security_employer_pct, notes, created_at",
    )
    .eq("employee_id", employeeId)
    .is("deleted_at", null)
    .order("effective_date", { ascending: false });

  return (data ?? []).map((s) => ({
    id: s.id,
    effectiveDate: s.effective_date,
    currency: s.currency,
    basic: num(s.basic),
    housing: num(s.housing_allowance),
    transport: num(s.transport_allowance),
    food: num(s.food_allowance),
    telephone: num(s.telephone_allowance),
    other: num(s.other_allowances),
    commissionFixed: num(s.commission_fixed),
    deductions: num(s.deductions),
    overtimeRateMultiplier: num(s.overtime_rate_multiplier) || 1.25,
    ssEmployeePct: num(s.social_security_employee_pct),
    ssEmployerPct: num(s.social_security_employer_pct),
    notes: s.notes,
    createdAt: s.created_at,
  }));
}
