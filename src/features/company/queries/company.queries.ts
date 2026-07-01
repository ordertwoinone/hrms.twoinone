import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Company, CompanyHoliday } from "../types";

/** The (single) company profile, or null if none exists yet. */
export async function getCompany(): Promise<Company | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
}

/** Public holidays for a company, earliest first. */
export async function getCompanyHolidays(
  companyId: string,
): Promise<CompanyHoliday[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("company_holidays")
    .select("*")
    .eq("company_id", companyId)
    .order("holiday_date", { ascending: true });
  return data ?? [];
}
