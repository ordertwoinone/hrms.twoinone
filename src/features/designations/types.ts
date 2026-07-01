import type { Database } from "@/types/database.types";

export type Designation = Database["public"]["Tables"]["designations"]["Row"];

export type DesignationStatus = "active" | "inactive";

/** A row in the designations list (department resolved to a name). */
export interface DesignationListItem {
  id: string;
  name: string;
  departmentId: string | null;
  departmentName: string | null;
  grade: string | null;
  description: string | null;
  status: DesignationStatus;
  createdAt: string;
}

export interface IdNameOption {
  id: string;
  name: string;
}
