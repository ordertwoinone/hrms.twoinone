import type { Database } from "@/types/database.types";

export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type CompanyHoliday =
  Database["public"]["Tables"]["company_holidays"]["Row"];
