import type { Database } from "@/types/database.types";

export type EmploymentType =
  Database["public"]["Tables"]["employment_types"]["Row"];

export type EmploymentTypeStatus = "active" | "inactive";

/** A row in the employment-types list. */
export interface EmploymentTypeListItem {
  id: string;
  name: string;
  description: string | null;
  status: EmploymentTypeStatus;
  isSystem: boolean;
  createdAt: string;
}
