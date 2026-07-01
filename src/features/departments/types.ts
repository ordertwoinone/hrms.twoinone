import type { Database } from "@/types/database.types";

export type Department = Database["public"]["Tables"]["departments"]["Row"];

export type DepartmentStatus = "active" | "inactive";

/** A row in the departments list (joins resolved, hierarchy depth computed). */
export interface DepartmentListItem {
  id: string;
  name: string;
  code: string;
  description: string | null;
  branchId: string | null;
  branchName: string | null;
  headId: string | null;
  headName: string | null;
  parentId: string | null;
  parentName: string | null;
  status: DepartmentStatus;
  /** Nesting depth in the hierarchy (0 = top level). */
  depth: number;
  createdAt: string;
}

export interface IdNameOption {
  id: string;
  name: string;
}

/** Select options needed by the department form. */
export interface DepartmentFormOptions {
  branches: IdNameOption[];
  heads: IdNameOption[];
}
